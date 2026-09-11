class AnnSetuAssistant:
    def __init__(self):
        self.knowledge_base = {
            "donate": "To donate food, click 'Donate Surplus Food' on your dashboard, provide quantity, prepared time, address and photo. Our AI will check freshness automatically!",
            "volunteer": "Volunteers receive real-time map alerts for nearby unassigned food rescues. Accept a task, navigate using Google Maps, and verify pickup with Donor OTP.",
            "ngo": "Registered NGOs receive food deliveries directly from volunteers and log beneficiary distribution statistics.",
            "freshness": "Our AI freshness engine evaluates food category, storage time, and visual metrics to calculate safe shelf-life window (0-100% score).",
            "safety": "All food donations must adhere to basic hygiene guidelines: cooked food must be dispatched within 4 hours of preparation.",
            "otp": "The 6-digit OTP ensures secure physical handover verification between food donor and rescue volunteer."
        }

    def respond(self, query: str) -> dict:
        q_lower = query.lower()
        
        for key, answer in self.knowledge_base.items():
            if key in q_lower:
                return {
                    "query": query,
                    "answer": answer,
                    "matched_topic": key,
                    "confidence": 0.95
                }

        return {
            "query": query,
            "answer": "AnnSetu AI Assistant: I can help you with Food Donation process, Volunteer rescue missions, NGO distribution, Food Freshness scores, and Safety Guidelines. How can I assist your mission today?",
            "matched_topic": "general",
            "confidence": 0.85
        }

annsetu_assistant = AnnSetuAssistant()
