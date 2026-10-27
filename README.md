# 🛣️ RoadGuardian AI — National Road Safety & Infrastructure Portal
### *Autonomous Civic Infrastructure Monitoring, Real-Time AI Damage Assessment & Public Procurement*

<div align="center">

[![Live Application](https://img.shields.io/badge/🌐_Live_App-road--guardian--ai--beta.vercel.app-138808?style=for-the-badge)](https://road-guardian-ai-beta.vercel.app)
[![Backend API](https://img.shields.io/badge/⚡_API_Gateway-roadguardian--ai--fhvy.onrender.com-000080?style=for-the-badge)](https://roadguardian-ai-fhvy.onrender.com/docs)
[![License](https://img.shields.io/badge/License-MIT-FF9933?style=for-the-badge)](#-license)

[![Frontend](https://img.shields.io/badge/Frontend-React_18_%7C_Vite_%7C_Tailwind-61DAFB?logo=react&logoColor=black)](https://road-guardian-ai-beta.vercel.app)
[![Backend](https://img.shields.io/badge/Backend-FastAPI_%7C_Python_3.11-009688?logo=fastapi&logoColor=white)](https://roadguardian-ai-fhvy.onrender.com)
[![Database](https://img.shields.io/badge/Database-Supabase_PostgreSQL-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com)
[![AI Vision](https://img.shields.io/badge/AI_Vision-Gemini_2.5_Flash-4285F4?logo=google&logoColor=white)](https://ai.google.dev/)
[![Offline PWA](https://img.shields.io/badge/PWA-Offline_First_%7C_LocalForage-5A0FC8?logo=pwa&logoColor=white)](#-offline-first-resilience)

</div>

---

## 📌 Executive Overview

**RoadGuardian AI** is an enterprise-grade civic infrastructure intelligence platform built to bridge the gap between citizens, municipal authorities, and public works contractors. By combining **Google Gemini 2.5 Flash Vision AI**, **offline-first Progressive Web App (PWA) synchronization**, and an **interactive WhatsApp civic triage simulator**, RoadGuardian empowers communities to detect, log, and monitor roadway hazards with verified civil engineering accuracy.

---

## 🌐 Live Production Deployments

| Resource | Environment | URL / Endpoint |
| :--- | :--- | :--- |
| **Official Web Portal** | Production (Vercel) | [https://road-guardian-ai-beta.vercel.app](https://road-guardian-ai-beta.vercel.app) |
| **API Backend Gateway** | Production (Render) | [https://roadguardian-ai-fhvy.onrender.com](https://roadguardian-ai-fhvy.onrender.com) |
| **Swagger Interactive Docs** | OpenAPI Specification | [https://roadguardian-ai-fhvy.onrender.com/docs](https://roadguardian-ai-fhvy.onrender.com/docs) |
| **System Health Check** | Live Telemetry Probe | [https://roadguardian-ai-fhvy.onrender.com/health](https://roadguardian-ai-fhvy.onrender.com/health) |

---

## 🎥 Video Demonstration & Walkthrough

<div align="center">

<!-- Animated High-Definition Walkthrough Demonstration -->
<a href="https://road-guardian-ai-beta.vercel.app/roadguardian-demo.mp4" target="_blank">
  <img src="docs/roadguardian-demo.gif" alt="RoadGuardian AI Video Demonstration" width="800" style="border-radius: 8px; border: 2px solid #FF9933; box-shadow: 0 4px 20px rgba(0,0,0,0.5);" />
</a>

<p align="center">
  <em>👆 Click the animation above to watch the <strong>High-Definition 720p HD MP4 Walkthrough</strong> (24s).</em>
</p>

[![Watch MP4 Demo](https://img.shields.io/badge/▶%EF%B8%8F_Play_HD_Video_(MP4)-docs%2Froadguardian--demo.mp4-138808?style=for-the-badge&logo=quicktime)](docs/roadguardian-demo.mp4)
[![Online Video Stream](https://img.shields.io/badge/🌐_Stream_Video-road--guardian--ai--beta.vercel.app%2Froadguardian--demo.mp4-000080?style=for-the-badge)](https://road-guardian-ai-beta.vercel.app/roadguardian-demo.mp4)
[![YouTube / Loom Placeholder](https://img.shields.io/badge/🎥_YouTube_Demo-Click_to_Watch-red?style=for-the-badge&logo=youtube)](https://www.youtube.com/watch?v=placeholder_video_id)

| Timestamp | Demonstration Phase | Validated Feature / Engineering Innovation |
| :---: | :--- | :--- |
| **00:00** | **Executive Intro** | National Road Safety Portal, Digital India Architecture & Live Node Telemetry |
| **00:03** | **Zero-Friction Onboarding** | Instant 1-Click Citizen Registration, Government ID issuing & Session persistence |
| **00:07** | **Gemini 2.5 Flash Vision AI** | Real-time road scan, pothole detection (94.8% conf), severity scoring (7.8/10) |
| **00:11** | **Strict Civil Validation** | Automatic rejection of screenshots/non-hazards to protect municipal bandwidth |
| **00:14** | **Offline-First PWA Sync** | Local IndexedDB queue, 1-Tap Manual Sync & zero data loss reconciliation |
| **00:18** | **WhatsApp Civic Bot** | End-to-end interactive reporting simulator, automatic triage & ticket dispatch |
| **00:21** | **Authority Portal & Tenders** | Departmental triage, live 3D heatmap clusters & public contractor repair tenders |

</div>

---

## 🏛️ Key Capabilities & Production Features

### 1. 🤖 Gemini 2.5 Flash Damage Assessment
- **Real-Time Visual Classification**: Detects potholes, alligator cracking, waterlogging, broken dividers, missing signage, and debris.
- **Strict Civil Engineering Validation**: Filters out screenshots, speed tests, portraits, documents, and indoor scenes with explicit `"Not a Road Hazard"` warnings to protect municipal bandwidth.
- **Automated Metric Extraction**: Produces severity scores ($0.0 - 10.0$) and urgency tiers (`low`, `medium`, `high`, `critical`).

### 2. 📶 Offline-First PWA Synchronization
- **IndexedDB / LocalForage Resilient Storage**: Reports filed with zero connectivity or during server sleep are saved instantly on device.
- **One-Tap Manual Sync**: Prominent **"Sync Now"** and **"Sync Queue (N)"** buttons located directly on the Dashboard and Navigation Bar.
- **Per-Item Storage Eviction**: Reports sync individually and clear from storage as soon as confirmed by the server, preventing duplicate records.

### 3. 💬 WhatsApp Civic Gateway & Interactive Simulator
- **Zero-Friction Citizen Access**: Citizens can report infrastructure defects via WhatsApp text or media without installing an app.
- **In-App Interactive Simulator**: Allows full end-to-end testing of Twilio webhook flows directly from the web portal.

### 4. 🏢 Department Official Authority Dashboard & Public Tenders
- **Multi-Department Triage**: Auto-routes incidents to the Road Department, Water & Sanitation Board, Forestry, or Power Department.
- **Contractor Tenders Portal**: Generates estimated municipal repair budgets and publishes open tenders for verified local contractors.
- **Interactive 3D Heatmap**: Visualizes spatial clustering, high-risk incident zones, and SLA breach deadlines across national highways.

### 5. 🏆 Gamification & Civic Incentives
- **National Leaderboard**: Civic scores, verified accuracy percentages, and gamification tiers (`Hero`, `Sentinel`, `Guardian`).
- **One-Click Instant Registration**: Instant guest bypasses and friction-free direct citizen sign-up alongside Google OAuth.

---

## 🏗️ System Architecture

```mermaid
flowchart TD
    subgraph Client ["Frontend Client — Vercel SPA / PWA"]
        A["Citizen Web / Mobile"] --> B["Camera / Upload Interface"]
        B --> C["Gemini 2.5 Flash Vision AI"]
        C --> D{"Network Reachable?"}
        D -- Yes --> E["FastAPI Gateway (/hazards/upload)"]
        D -- No --> F["Local IndexedDB Offline Queue"]
        F --> G["One-Tap Manual Sync"]
        G --> E
    end

    subgraph Messaging ["Civic Messaging Integration"]
        WA["WhatsApp Citizen"] --> TW["Twilio Webhook (/whatsapp/webhook)"]
        TW --> E
    end

    subgraph Backend ["Backend Node — Render FastAPI"]
        E --> H["Auth & Token Dependency Validator"]
        H --> I["Triage Engine & Weather / Traffic Modifiers"]
        I --> J["Async Geocoding Thread Pool"]
        I --> K["PostgreSQL Session / Transaction Pool"]
        I --> WS["WebSocket Real-Time Broadcast (/ws/hazards)"]
    end

    subgraph Data ["Cloud Persistence Layer — Supabase"]
        K --> DB[("PostgreSQL Database (Australia Pooler)")]
        E --> S3["Supabase Asset Storage Bucket"]
    end

    WS --> L["Official Authority Portal"]
    WS --> M["Live Geospatial 3D Heatmap"]
```

---

## 💻 Tech Stack

| Domain | Technologies |
| :--- | :--- |
| **Frontend** | React 18, TypeScript, Vite 5.4, Tailwind CSS, Framer Motion, Zustand, LocalForage |
| **Backend** | Python 3.11, FastAPI, SQLAlchemy 2.0 (AsyncIO), Asyncpg, Pydantic v2, Uvicorn |
| **Artificial Intelligence** | Google Gemini 2.5 Flash Vision API, YOLOv8 (Ultralytics), Whisper Audio |
| **Database & Auth** | Supabase Managed PostgreSQL (Connection Pooler), Supabase Auth, JWT |
| **Maps & Spatial** | MapLibre GL, CartoDB Voyager 3D Vector Tiles, Nominatim Reverse Geocoding |
| **Cloud Hosting** | Vercel (Edge SPA Hosting), Render (Containerized Web Service) |

---

## 🚀 Local Development Setup

### 1. Prerequisites
- **Python 3.11+**
- **Node.js 18+** & **npm 9+**
- **Git**

### 2. Clone the Repository
```bash
git clone https://github.com/Aspirant200715/RoadGuardian_AI.git
cd RoadGuardian_AI
```

### 3. Backend Setup
```bash
cd roadguardian-backend

# Create virtual environment
python3 -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Fill in your SUPABASE_URL, SUPABASE_ANON_KEY, DATABASE_URL, and GEMINI_API_KEY

# Start backend development server
uvicorn main:app --reload --port 8000
```

### 4. Frontend Setup
```bash
cd ../roadguardian-frontend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Set VITE_API_URL=http://localhost:8000 and your VITE_GEMINI_API_KEY

# Launch Vite development server
npm run dev
```

Navigate to `http://localhost:5173` in your browser.

---

## ⚙️ Environment Variables Reference

### Backend Configuration (`roadguardian-backend/.env`)
```ini
APP_NAME=RoadGuardian_AI
APP_VERSION=2.0.0
DEBUG=False
PORT=8000

# PostgreSQL Connection (Supabase Session Pooler)
DATABASE_URL=postgresql+asyncpg://postgres.[ref]:[password]@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres

# Supabase Credentials
SUPABASE_URL=https://[ref].supabase.co
SUPABASE_ANON_KEY=[your-anon-key]
SUPABASE_SERVICE_ROLE_KEY=[your-service-role-key]

# Artificial Intelligence
GEMINI_API_KEY=[your-gemini-api-key]

# Permitted CORS Origins
CORS_ORIGINS=["https://road-guardian-ai-beta.vercel.app","http://localhost:5173","http://127.0.0.1:5173"]
```

### Frontend Configuration (`roadguardian-frontend/.env`)
```ini
VITE_API_URL=https://roadguardian-ai-fhvy.onrender.com
VITE_CLIENT_URL=https://road-guardian-ai-beta.vercel.app
VITE_SUPABASE_URL=https://[ref].supabase.co
VITE_SUPABASE_ANON_KEY=[your-anon-key]
VITE_GEMINI_API_KEY=[your-gemini-api-key]
```

---

## 📡 REST API Specification

### Primary Endpoints

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/hazards/upload` | Multipart form image upload & AI scoring | Authenticated / Guest |
| `GET` | `/hazards/my-reports` | Retrieve citizen report history & recent events | Authenticated |
| `GET` | `/hazards/public/active` | Geospatial list of active unresolved incidents | Public |
| `GET` | `/hazards/dashboard` | Authority analytics, department loads, SLAs | Department Official |
| `POST` | `/hazards/authority/assign/{id}` | Assign repair crew and update ticket | Department Official |
| `POST` | `/whatsapp/webhook` | Twilio inbound webhook & simulator endpoint | Public / Twilio |
| `GET` | `/health` | Service uptime and database connectivity probe | Public |

Interactive Swagger documentation is live at: [https://roadguardian-ai-fhvy.onrender.com/docs](https://roadguardian-ai-fhvy.onrender.com/docs)

---

## 🔒 Security & Reliability Engineering

- **CORS Wildcard Policy**: Preflight `OPTIONS` requests and all standard responses forward `Access-Control-Allow-Origin: <origin>` with `Access-Control-Allow-Credentials: true`.
- **Database Pool Pre-Ping**: Database connection health check configured with `pool_pre_ping=True` and `pool_recycle=60` to eliminate dead pool sockets across international regions.
- **Thread-Isolated Geocoding**: Reverse-geocoding wrapped in asynchronous worker threads with an enforced 1.5-second cap to prevent thread starvation.
- **Zero-Latency JWT Parsing**: Client-side hash decoding enables instant session initialization without redundant roundtrips.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**RoadGuardian AI** • *Built for safer roads, resilient infrastructure, and empowered communities worldwide.*

</div>
