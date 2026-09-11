import { Server } from 'socket.io';
import { logger } from '../utils/winstonLogger.js';

let ioInstance = null;

export const initSockets = (server) => {
  ioInstance = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  ioInstance.on('connection', (socket) => {
    logger.info(`New WebSocket connection: ${socket.id}`);

    socket.on('join_volunteer_room', (data) => {
      socket.join('volunteers');
      logger.info(`Socket ${socket.id} joined volunteers room`);
    });

    socket.on('volunteer_location_update', (data) => {
      // Broadcast volunteer live coordinates to donor or NGO tracking room
      if (data.donationId) {
        socket.to(`donation_track_${data.donationId}`).emit('live_volunteer_position', data);
      }
    });

    socket.on('join_donation_track', (donationId) => {
      socket.join(`donation_track_${donationId}`);
      logger.info(`Socket ${socket.id} tracking donation ${donationId}`);
    });

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.id}`);
    });
  });

  return ioInstance;
};

export const getIO = () => {
  if (!ioInstance) {
    logger.warn('Socket.io instance requested before initialization');
  }
  return ioInstance;
};
