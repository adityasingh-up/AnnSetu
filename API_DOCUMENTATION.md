# AnnSetu API Documentation

## Authentication Endpoints (`/api/v1/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/register` | Register new user (Donor, Volunteer, NGO) | No |
| `POST` | `/login` | Authenticate user & get JWT tokens | No |
| `GET`  | `/me` | Get current user profile details | Yes (Bearer) |
| `PUT`  | `/profile` | Update user location, vehicle, or phone | Yes (Bearer) |

---

## Food Donation Endpoints (`/api/v1/donations`)

| Method | Endpoint | Description | Role Required |
|--------|----------|-------------|---------------|
| `POST` | `/` | Post food donation with AI freshness evaluation | Donor / Admin |
| `GET`  | `/nearby` | Get pending nearby donations (Geospatial 2dsphere) | Volunteer / NGO / Admin |
| `GET`  | `/my` | List logged-in donor's historical donations | Donor |
| `GET`  | `/:id` | Fetch specific donation item details | All Auth Users |

---

## Volunteer Rescue Workflow (`/api/v1/volunteer`)

| Method | Endpoint | Description | Role Required |
|--------|----------|-------------|---------------|
| `POST` | `/accept/:id` | Accept nearby rescue task & send OTP to donor | Volunteer / Admin |
| `POST` | `/verify-pickup` | Verify 6-digit OTP code upon physical food handover | Volunteer / Admin |
| `POST` | `/complete-delivery` | Submit delivery proof photo & award 50 badge points | Volunteer / Admin |
| `GET`  | `/missions` | List volunteer's mission history | Volunteer / Admin |

---

## NGO Management Endpoints (`/api/v1/ngo`)

| Method | Endpoint | Description | Role Required |
|--------|----------|-------------|---------------|
| `POST` | `/claim/:id` | Claim unassigned donation for NGO distribution | NGO / Admin |
| `GET`  | `/inventory` | View claimed food inventory & rescue logs | NGO / Admin |
| `PUT`  | `/profile` | Update storage capacity & active beneficiary counts | NGO / Admin |

---

## Admin & Governance Endpoints (`/api/v1/admin`)

| Method | Endpoint | Description | Role Required |
|--------|----------|-------------|---------------|
| `GET`  | `/analytics` | Retrieve platform-wide rescue metrics & totals | Admin |
| `GET`  | `/users` | Paginated users list with role filtering | Admin |
| `PATCH`| `/users/:id/toggle-status` | Block or unblock user account | Admin |
| `GET`  | `/reports/pdf` | Stream generated PDF analytics report | Admin |
| `GET`  | `/reports/excel` | Stream generated Excel XLSX spreadsheet report | Admin |

---

## AI Microservice Endpoints (`http://localhost:8000`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/predict-freshness` | Evaluates food freshness score & safe shelf life (hours) |
| `POST` | `/recommend-volunteers` | Multi-criteria scoring ranking nearest volunteers |
| `POST` | `/optimize-route` | Haversine distance & travel time estimation |
| `GET`  | `/forecast-demand` | 7-day predictive surplus & demand forecaster |
| `POST` | `/chatbot` | NLP engine answering platform questions |
