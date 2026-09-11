# AnnSetu: AI-Powered Smart Food Rescue & Distribution Platform

![AnnSetu Platform](https://images.unsplash.com/photo-1593113598332-cd288d649433?w=1200)

**AnnSetu** is an enterprise-grade, production-ready B.Tech Major Project & Startup Web Platform designed to eliminate urban food waste. It seamlessly connects food donors (restaurants, hotels, event caterers, citizens) with verified NGOs and volunteer hero dispatchers using Machine Learning freshness evaluation, geospatial Haversine routing, Socket.io real-time tracking, and secured OTP handover verification.

---

## 🌟 Key Features

- **🤖 AI Freshness & Shelf-Life Estimation**: Scikit-Learn Python microservice evaluates food category, storage parameters, and preparation timestamp to calculate safe distribution windows (0-100% score).
- **🛰️ Smart Volunteer Dispatch**: Multi-criteria decision engine ranks volunteers based on real-time distance, rating, and vehicle speed.
- **🔐 Secured Handover (6-Digit OTP)**: Donors receive a one-time passcode upon task acceptance to verify physical pickup.
- **🗺️ Real-Time Geospatial Map Tracking**: Interactive Leaflet maps show live rescue locations, active missions, and optimized delivery routes.
- **📊 Comprehensive Governance & Analytics**: Recharts dashboard for admins with instant export to **PDF** and **Excel** reports.
- **💬 Built-in AI Assistant**: Interactive NLP chatbot supporting donation rules and safety guidance.

---

## 📁 System Architecture & Directory Structure

```
annsetu/
├── backend/
│   ├── config/             # DB, Cloudinary, Env configurations
│   ├── controllers/        # Auth, Donation, Volunteer, NGO, Admin controllers
│   ├── services/           # AI integration, Email, PDF/Excel export services
│   ├── repository/         # Data access repository layer
│   ├── models/             # Mongoose schemas (User, FoodDonation, NGOProfile, Delivery, Notification)
│   ├── routes/             # Express API routes with rate limiters & validation
│   ├── middleware/         # Auth, RBAC, Error Handler, Winston Logger
│   ├── validations/        # Express-Validator schemas
│   ├── helpers/            # OTP generator, response wrapper
│   ├── utils/              # Winston logger, Haversine distance
│   ├── cron/               # Node-Cron food expiry monitor
│   ├── sockets/            # Socket.io live tracking & broadcast notifications
│   └── server.js           # Express main server
├── ai_module/
│   ├── food_freshness/     # Shelf-life predictor model
│   ├── volunteer_recommendation/ # Haversine multi-criteria volunteer scoring
│   ├── prediction/         # Waste forecaster & route distance optimizer
│   ├── chatbot/            # NLP FAQ assistant engine
│   ├── app.py              # FastAPI server entrypoint
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── components/     # Navbar, Sidebar, StatCard, DonationCard, MapView, OTPModal, ChatbotWidget
    │   ├── context/        # AuthContext, ThemeContext, SocketContext
    │   ├── pages/          # Home, Login, Register, Donor, Volunteer, NGO, Admin dashboards
    │   ├── routes/         # AppRoutes & ProtectedRoute
    │   └── services/       # Axios API client instances
    ├── index.html
    ├── vite.config.js
    └── tailwind.config.js
```

---

## 🚀 Quickstart & Setup Guide

### 1. Backend Service (Node.js & MongoDB)
```bash
cd backend
npm install
npm run dev
# Server running at http://localhost:5000
```

### 2. AI Microservice (Python FastAPI)
```bash
cd ai_module
pip install -r requirements.txt
python app.py
# FastAPI running at http://localhost:8000
```

### 3. Frontend Web Application (Vite + React)
```bash
cd frontend
npm install
npm run dev
# Frontend running at http://localhost:5173
```

---

## 🔒 User Roles

1. **Donor**: Post excess food, get instant AI freshness scores, track pickup with OTP.
2. **Volunteer**: Receive nearby rescue alerts, view turn-by-turn map routing, verify OTP, earn badge points.
3. **NGO**: Claim food inventory, log beneficiary meals, track incoming deliveries.
4. **Admin**: Platform oversight, user activation/blocking, heatmaps, PDF/Excel report exports.
