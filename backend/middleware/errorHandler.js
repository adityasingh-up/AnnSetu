import { logger } from '../utils/winstonLogger.js';
import { sendError } from '../helpers/responseHelper.js';

export const errorHandler = (err, req, res, next) => {
  logger.error(`Error handling request ${req.method} ${req.url}: ${err.message}`, { stack: err.stack });

  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';
  const errors = err.errors || null;

  return sendError(res, statusCode, message, errors);
};

export const notFoundHandler = (req, res, next) => {
  return sendError(res, 404, `Route ${req.originalUrl} not found on this server.`);
};
