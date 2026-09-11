from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

from food_freshness.freshness_model import freshness_predictor
from volunteer_recommendation.recommender import volunteer_recommender
from prediction.route_optimizer import route_optimizer
from prediction.waste_forecaster import waste_forecaster
from chatbot.assistant import annsetu_assistant

app = FastAPI(
    title="AnnSetu AI Microservice API",
    description="Intelligent Food Freshness Evaluation, Volunteer Dispatch, Route Optimization & Waste Forecasting",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request Models
class FreshnessRequest(BaseModel):
    food_category: str
    food_type: Optional[str] = "veg"
    quantity_kg: float
    prepared_at: str
    image_url: Optional[str] = ""

class RecommendVolunteersRequest(BaseModel):
    donation_coords: List[float] # [lon, lat]
    volunteers: List[dict]

class RouteRequest(BaseModel):
    origin: dict
    destination: dict

class ChatbotRequest(BaseModel):
    query: str

@app.get("/")
def health_check():
    return {
        "status": "ONLINE",
        "service": "AnnSetu AI Microservice Engine",
        "modules": ["food_freshness", "volunteer_recommendation", "prediction", "chatbot"]
    }

@app.post("/predict-freshness")
def predict_freshness(req: FreshnessRequest):
    return freshness_predictor.predict(
        req.food_category, req.food_type, req.quantity_kg, req.prepared_at
    )

@app.post("/recommend-volunteers")
def recommend_volunteers(req: RecommendVolunteersRequest):
    return volunteer_recommender.rank_volunteers(
        req.donation_coords, req.volunteers
    )

@app.post("/optimize-route")
def optimize_route(req: RouteRequest):
    return route_optimizer.optimize(req.origin, req.destination)

@app.get("/forecast-demand")
def forecast_demand():
    return waste_forecaster.forecast_demand()

@app.post("/chatbot")
def chatbot_query(req: ChatbotRequest):
    return annsetu_assistant.respond(req.query)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
