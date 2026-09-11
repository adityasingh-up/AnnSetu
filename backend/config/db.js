import mongoose from 'mongoose';
import dns from 'dns';
import { ENV } from './env.js';
import { logger } from '../utils/winstonLogger.js';

// Configure DNS resolution for MongoDB Atlas SRV lookup on Windows / local ISPs
try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
  if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder('ipv4first');
  }
} catch (dnsErr) {
  // Ignore DNS config error if not permitted
}

let mongodInstance = null;

export const connectDB = async () => {
  // Try connecting to the URI from .env first (local or Atlas)
  try {
    logger.info(`🔌 Attempting MongoDB connection to: ${ENV.MONGO_URI.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@')}`);
    const conn = await mongoose.connect(ENV.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
    });
    logger.info(`✅ MongoDB Connected: ${conn.connection.host} / DB: ${conn.connection.name}`);
    logger.info(`📦 Data is being stored in MongoDB Atlas database: "${conn.connection.name}"`);
    logger.info(`🔗 View your data at: https://cloud.mongodb.com (Login → Cluster0 → Browse Collections → ${conn.connection.name})`);
    return;
  } catch (error) {
    logger.warn(`⚠️  Primary MongoDB unavailable (${error.message}). Starting In-Memory MongoDB...`);
  }

  // Fallback: mongodb-memory-server (already installed & cached)
  try {
    const { MongoMemoryServer } = await import('mongodb-memory-server');

    mongodInstance = await MongoMemoryServer.create({
      instance: {
        dbName: 'annsetu',
        port: 27018,
      },
    });

    const uri = mongodInstance.getUri();
    await mongoose.connect(uri);
    logger.info(`🚀 In-Memory MongoDB running at ${uri} (data resets on server restart)`);
    logger.warn(`📌 For persistent data, set MONGO_URI in backend/.env to a MongoDB Atlas connection string`);
  } catch (memErr) {
    logger.error(`❌ All DB connections failed: ${memErr.message}`);
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.disconnect();
  if (mongodInstance) await mongodInstance.stop();
  process.exit(0);
});
