import math

def calculate_haversine(lat1, lon1, lat2, lon2):
    R = 6371
    dLat = math.radians(lat2 - lat1)
    dLon = math.radians(lon2 - lon1)
    a = math.sin(dLat / 2) ** 2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dLon / 2) ** 2
    return R * (2 * math.atan2(math.sqrt(a), math.sqrt(1 - a)))

class RouteOptimizer:
    def optimize(self, origin: dict, destination: dict) -> dict:
        orig_coords = origin.get("coordinates", [77.209, 28.6139])
        dest_coords = destination.get("coordinates", [77.230, 28.6250])

        dist_km = calculate_haversine(orig_coords[1], orig_coords[0], dest_coords[1], dest_coords[0])
        est_mins = max(5, int(dist_km * 2.5)) # Average speed ~ 24 km/h urban traffic

        return {
            "origin": origin,
            "destination": destination,
            "estimated_distance_km": round(dist_km, 2),
            "estimated_time_mins": est_mins,
            "fuel_saved_liters": round(dist_km * 0.08, 2),
            "carbon_offset_kg": round(dist_km * 0.15, 2)
        }

route_optimizer = RouteOptimizer()
