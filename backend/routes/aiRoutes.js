import express from 'express';
import aiService from '../services/aiService.js';
import { sendResponse, sendError } from '../helpers/responseHelper.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Rate limiter for AI queries (max 30 queries per 10 minutes per IP)
const aiLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many AI requests. Please try again after 10 minutes.'
  }
});

// Chatbot query endpoint
router.post('/chatbot', aiLimiter, async (req, res, next) => {
  try {
    const { query } = req.body;
    if (!query || !query.trim()) {
      return sendError(res, 400, 'Query text is required.');
    }
    const result = await aiService.chatbotQuery(query.trim());
    return sendResponse(res, 200, true, 'AI response generated', result);
  } catch (error) {
    next(error);
  }
});

// Freshness evaluation test endpoint
router.post('/predict-freshness', aiLimiter, async (req, res, next) => {
  try {
    const result = await aiService.predictFreshness(req.body);
    return sendResponse(res, 200, true, 'Freshness evaluated', result);
  } catch (error) {
    next(error);
  }
});

// Demand forecasting
router.get('/forecast-demand', async (req, res, next) => {
  try {
    const result = await aiService.forecastDemand();
    return sendResponse(res, 200, true, 'Demand forecast', result);
  } catch (error) {
    next(error);
  }
});

// AI Engine Health
router.get('/health', async (req, res, next) => {
  try {
    const health = await aiService.checkHealth();
    return sendResponse(res, 200, true, 'AI Service Health', health);
  } catch (error) {
    next(error);
  }
});

export default router;
