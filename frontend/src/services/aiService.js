import api from './api';

export const aiService = {
  // Chat with AnnSetu AI Assistant (FastAPI backend)
  chatbotQuery: async (query) => {
    const response = await api.post('/ai/chatbot', { query });
    return response.data;
  },

  // Evaluate Food Freshness via AI model
  predictFreshness: async (foodData) => {
    const response = await api.post('/ai/predict-freshness', foodData);
    return response.data;
  },

  // Demand forecasting
  getDemandForecast: async () => {
    const response = await api.get('/ai/forecast-demand');
    return response.data;
  },

  // Check AI Service status
  getHealth: async () => {
    const response = await api.get('/ai/health');
    return response.data;
  }
};

export default aiService;
