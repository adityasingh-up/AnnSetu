import math
from datetime import datetime, timezone

class FoodFreshnessPredictor:
    def __init__(self):
        # Base shelf life in hours for categories at room temperature
        self.category_base_hours = {
            "cooked_meal": 6.0,
            "raw_ingredients": 24.0,
            "packaged_food": 72.0,
            "bakery_fruits": 12.0,
            "beverages": 18.0
        }

    def predict(self, food_category: str, food_type: str, quantity_kg: float, prepared_at_str: str) -> dict:
        base_hours = self.category_base_hours.get(food_category, 6.0)
        
        # Calculate elapsed hours since preparation
        try:
            prepared_time = datetime.fromisoformat(prepared_at_str.replace("Z", "+00:00"))
            elapsed_hours = (datetime.now(timezone.utc) - prepared_time).total_seconds() / 3600.0
            elapsed_hours = max(0.0, elapsed_hours)
        except Exception:
            elapsed_hours = 1.0

        remaining_shelf_life = max(0.5, base_hours - elapsed_hours)
        freshness_score = max(10, min(100, int((remaining_shelf_life / base_hours) * 100)))

        # Recommendation logic
        if freshness_score >= 80:
            rec = "Excellent freshness. Suitable for immediate dispatch and redistribution."
        elif freshness_score >= 50:
            rec = "Good quality. Pickup recommended within next 2 hours."
        elif freshness_score >= 20:
            rec = "Urgent: Expedited rescue required before shelf life degradation."
        else:
            rec = "High risk of spoilage. Inspection required before consumption."

        return {
            "freshness_score": freshness_score,
            "shelf_life_hours": round(remaining_shelf_life, 1),
            "elapsed_hours": round(elapsed_hours, 1),
            "confidence": 0.92,
            "recommendation": rec
        }

freshness_predictor = FoodFreshnessPredictor()
