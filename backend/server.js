import http from 'http';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import { ENV } from './config/env.js';
import { connectDB } from './config/db.js';
import { logger, stream } from './utils/winstonLogger.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import { initSockets } from './sockets/socketHandler.js';
import { startExpiryMonitorCron } from './cron/expiryCron.js';

// Route Imports
import authRoutes from './routes/authRoutes.js';
import donationRoutes from './routes/donationRoutes.js';
import volunteerRoutes from './routes/volunteerRoutes.js';
import ngoRoutes from './routes/ngoRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import aiRoutes from './routes/aiRoutes.js';

const app = express();
const server = http.createServer(app);

// Connect Database
connectDB();

// Initialize Socket.io
initSockets(server);

// Start Cron Jobs
startExpiryMonitorCron();

// Middlewares
app.use(helmet());
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('combined', { stream }));

// Rate Limiter
app.use('/api', apiLimiter);

// Root & Health check endpoints
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to AnnSetu AI Food Rescue API Server',
    health: 'http://localhost:5000/health',
    documentation: 'See API_DOCUMENTATION.md for endpoint contracts'
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    platform: 'AnnSetu AI Food Rescue',
    timestamp: new Date().toISOString()
  });
});

// DEV ONLY: Database status & viewer (remove in production)
import mongoose from 'mongoose';
import User from './models/User.js';

app.get('/api/v1/db-status', async (req, res) => {
  try {
    const dbState = mongoose.connection.readyState;
    const stateMap = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
    
    const users = await User.find({}).select('-password -emailVerificationOTP');
    const dbInfo = {
      databaseStatus: stateMap[dbState] || 'unknown',
      databaseHost: mongoose.connection.host,
      databaseName: mongoose.connection.name,
      databaseType: mongoose.connection.host === '127.0.0.1' ? '⚠️ In-Memory (data lost on restart)' : '✅ MongoDB Atlas (persistent)',
      totalRegisteredUsers: users.length,
      users: users
    };
    
    res.status(200).json({
      success: true,
      message: 'Database status and registered users',
      data: dbInfo
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/donations', donationRoutes);
app.use('/api/v1/volunteer', volunteerRoutes);
app.use('/api/v1/ngo', ngoRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/ai', aiRoutes);

// Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

const PORT = ENV.PORT;
server.listen(PORT, () => {
  logger.info(`🚀 AnnSetu Backend Server running on port ${PORT} [${ENV.NODE_ENV}]`);
});
