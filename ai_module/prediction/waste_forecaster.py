import numpy as np

class WasteForecaster:
    def forecast_demand(self, historical_days: int = 7) -> dict:
        # Simulate predictive regression trend model for food wastage & rescue demand
        days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        base_demand_kg = [120, 115, 130, 145, 180, 240, 210] # Higher demand on weekends
        
        predicted_trend = []
        for idx, day in enumerate(days):
            variance = float(np.random.normal(0, 10))
            val = max(50, int(base_demand_kg[idx] + variance))
            predicted_trend.append({"day": day, "expected_surplus_kg": val, "expected_meals": val * 4})

        return {
            "forecast_period": "7_days",
            "weekly_expected_total_kg": sum([item["expected_surplus_kg"] for item in predicted_trend]),
            "daily_trend": predicted_trend,
            "peak_day": "Sat",
            "recommendation": "Deploy 35% more volunteers on Friday and Saturday evening rescue shifts."
        }

waste_forecaster = WasteForecaster()
