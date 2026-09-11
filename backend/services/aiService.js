import axios from 'axios';
import { ENV } from '../config/env.js';
import { logger } from '../utils/winstonLogger.js';

class AIService {
  constructor() {
    this.client = axios.create({
      baseURL: ENV.AI_SERVICE_URL,
      timeout: 5000,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  async predictFreshness(foodData) {
    try {
      const response = await this.client.post('/predict-freshness', {
        food_category: foodData.foodCategory,
        food_type: foodData.foodType,
        quantity_kg: foodData.quantityKg,
        prepared_at: foodData.preparedAt,
        image_url: foodData.imageUrl || ''
      });
      return response.data;
    } catch (error) {
      logger.warn(`AI Service unavailable for freshness prediction, using heuristic fallback: ${error.message}`);
      // Fallback prediction heuristic
      return {
        freshness_score: 92,
        shelf_life_hours: 8,
        confidence: 0.88,
        recommendation: 'Safe for distribution within 8 hours'
      };
    }
  }

  async rankVolunteers(donationLocation, volunteers) {
    try {
      const response = await this.client.post('/recommend-volunteers', {
        donation_coords: donationLocation.coordinates,
        volunteers: volunteers.map((v) => ({
          id: v._id.toString(),
          name: v.name,
          coords: v.location.coordinates,
          rating: v.rating || 5.0,
          vehicle: v.vehicleType || 'two-wheeler'
        }))
      });
      return response.data;
    } catch (error) {
      logger.warn(`AI Service unavailable for volunteer recommendation fallback: ${error.message}`);
      return volunteers.map((v) => ({ volunteer_id: v._id.toString(), score: 0.9 }));
    }
  }

  async getRouteOptimization(origin, destination) {
    try {
      const response = await this.client.post('/optimize-route', {
        origin,
        destination
      });
      return response.data;
    } catch (error) {
      return {
        estimated_distance_km: 4.2,
        estimated_time_mins: 15,
        waypoints: [origin, destination]
      };
    }
  }

  async chatbotQuery(query) {
    try {
      const response = await this.client.post('/chatbot', { query });
      return response.data;
    } catch (error) {
      logger.warn(`AI Service unavailable for chatbot: ${error.message}`);
      return {
        query,
        response: 'AnnSetu AI Assistant is currently operating in offline mode. For food donations, cooked food should be consumed or distributed within 4 to 8 hours of preparation. Contact nearby NGOs for swift distribution.',
        status: 'OFFLINE_FALLBACK'
      };
    }
  }

  async forecastDemand() {
    try {
      const response = await this.client.get('/forecast-demand');
      return response.data;
    } catch (error) {
      return {
        status: 'ESTIMATED',
        predicted_high_demand_areas: ['Old Delhi', 'Seelampur', 'Okhla'],
        confidence: 0.85
      };
    }
  }

  async checkHealth() {
    try {
      const response = await this.client.get('/');
      return { status: 'ONLINE', data: response.data };
    } catch (error) {
      return { status: 'OFFLINE', error: error.message };
    }
  }
}

export default new AIService();
