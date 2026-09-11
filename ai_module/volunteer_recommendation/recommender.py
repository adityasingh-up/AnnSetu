import math

def calculate_haversine(lat1, lon1, lat2, lon2):
    R = 6371  # km
    dLat = math.radians(lat2 - lat1)
    dLon = math.radians(lon2 - lon1)
    a = math.sin(dLat / 2) ** 2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dLon / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

class VolunteerRecommender:
    def rank_volunteers(self, donation_coords: list, volunteers: list) -> list:
        if not volunteers:
            return []
            
        don_lon, don_lat = donation_coords[0], donation_coords[1]
        vehicle_speed_multiplier = {
            "four-wheeler": 1.2,
            "van": 1.1,
            "three-wheeler": 1.0,
            "two-wheeler": 0.9,
            "none": 0.5
        }

        ranked = []
        for vol in volunteers:
            v_lon, v_lat = vol["coords"][0], vol["coords"][1]
            dist_km = calculate_haversine(don_lat, don_lon, v_lat, v_lon)
            rating = vol.get("rating", 5.0)
            veh = vol.get("vehicle", "two-wheeler")
            mult = vehicle_speed_multiplier.get(veh, 1.0)

            # Score calculation: Closer distance + higher rating + faster vehicle = higher score
            distance_score = max(0, 1.0 - (dist_km / 25.0)) # Normalized 0 to 1
            rating_score = rating / 5.0

            final_score = (0.5 * distance_score) + (0.3 * rating_score) + (0.2 * mult)

            ranked.append({
                "volunteer_id": vol["id"],
                "name": vol["name"],
                "distance_km": round(dist_km, 2),
                "score": round(final_score, 3),
                "eta_mins": max(5, int(dist_km * 3 / mult))
            })

        # Sort descending by score
        ranked.sort(key=lambda x: x["score"], reverse=True)
        return ranked

volunteer_recommender = VolunteerRecommender()
