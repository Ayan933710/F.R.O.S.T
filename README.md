# ❄️ F.R.O.S.T
> **Integrated Polar Expedition Logistics and Asset Management System**

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=FastAPI&logoColor=white)
![Yjs](https://img.shields.io/badge/Yjs-CRDT-blue?style=for-the-badge)

F.R.O.S.T (Forward Resupply & Operations Support Terminal) is a resilient, offline-capable 3-tier micro-architecture platform designed for extreme-climate or tactical logistics tracking. It ensures seamless supply requisition, cold-chain inventory monitoring, and collaborative real-time updates across multiple research stations (e.g., Maitri, Bharati, Himadri) even in low-bandwidth or disconnected environments.

---

## 🏗️ System Architecture

The F.R.O.S.T platform utilizes a decoupled 3-tier architecture:

```text
┌─────────────────┐       WebSocket (Yjs CRDT)       ┌──────────────────┐
│                 │      HTTP REST API (Axios)       │                  │
│  React Frontend ├─────────────────────────────────►│  Node.js Backend │
│  (Vite + Yjs)   │                                  │  (Express.js)    │
│                 │                                  │                  │
└─────────────────┘                                  └────────┬─────────┘
                                                              │
                                                        HTTP (REST)
                                                              │
┌──────────────────┐                                 ┌────────▼─────────┐
│                  │                                 │                  │
│ MongoDB Atlas    │◄─────── Mongoose ODM ───────────┤   Python ML      │
│ (Persistence)    │                                 │   Service        │
│                  │                                 │  (FastAPI)       │
└──────────────────┘                                 └──────────────────┘
```

---

## 🛠️ Tech Stack Breakdown

### 1. Frontend (Client)
- **Framework:** React 19 + Vite
- **Styling:** Tailwind CSS + Lucide React Icons
- **State/Sync:** Yjs (CRDT engine) + IndexedDB (offline persistence)
- **Maps:** Leaflet & React Simple Maps

### 2. Backend API (Server)
- **Runtime:** Node.js (v18+)
- **Framework:** Express.js
- **Database ODM:** Mongoose
- **Sync Server:** Custom Yjs WebSocket server attached to Express
- **Security:** JWT, bcryptjs, CORS

### 3. ML Service (Prediction Engine)
- **Language:** Python (3.10+)
- **Framework:** FastAPI / Uvicorn
- **ML Libraries:** XGBoost, Scikit-Learn, Pandas, Numpy, Joblib
- **Role:** Predictive baseline stock thresholds, transport window safety inference, and consumption modeling.

### 4. Database & Storage
- **Provider:** MongoDB Atlas (Cloud)
- **Models:** Users, Items, Requisitions, Manifests, Expeditions, AuditLogs, Geofences.

---

## 📂 Directory Structure

```text
HEEM_SANCHAR/
├── backend/                  # Node.js + Express API
│   ├── controllers/          # Business logic & route handlers
│   ├── models/               # Mongoose schemas (User, Item, Manifest, etc.)
│   ├── .env                  # Environment variables (Mongo URI, Ports)
│   ├── package.json          # Node dependencies
│   ├── seed.js               # Mock data baseline seeder
│   └── server.js             # Express application & Yjs WS server entrypoint
│
├── frontend/                 # React + Vite Client
│   ├── public/               # Static assets (3D models, videos)
│   ├── src/                  # React source code
│   │   ├── components/       # Reusable UI components
│   │   ├── context/          # React Context (Auth, Theme)
│   │   ├── pages/            # Admin & Commander dashboards
│   │   └── utils/            # CRDT Store, API helpers
│   ├── index.html            # Entry HTML
│   ├── package.json          # Frontend dependencies
│   └── vite.config.js        # Vite bundler configuration
│
└── ml_service/               # Python Predictive Microservice
    ├── main.py               # FastAPI application entrypoint
    ├── train_model.py        # XGBoost model training script
    ├── requirements.txt      # Python dependencies
    └── xgboost_model.joblib  # Trained model binary
```

---

## 📋 Prerequisites

To run this project locally, ensure you have the following installed:
- **Node.js** (v18+ or v20+) & **npm**
- **Python** (v3.10+)
- **Git**
- **MongoDB Atlas** Account (or local MongoDB instance)

---

## ⚙️ Environment Configuration

Create a `.env` file in the **`backend/`** directory. (The `ml_service` runs on default port `8000` and doesn't require a `.env` out of the box unless specified).

**`backend/.env` Template:**
```env
# Server Configuration
PORT=5000

# Database Connection (MongoDB)
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.example.mongodb.net/frost_db?retryWrites=true&w=majority

# JWT Authentication
JWT_SECRET=your_super_secret_jwt_key_here

# Machine Learning Service URL
ML_URL=http://localhost:8000
```

---

## 🚀 End-to-End Installation & Quickstart Guide

Open three separate terminal windows to run the microservices simultaneously.

### Step 1: MongoDB Database Setup & Seeding
In Terminal 1, set up the backend and seed the database with baseline mock data:
```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Make sure your .env file is configured!
# Seed the MongoDB database with baseline users and items
node seed.js
```

### Step 2: Backend API Launch
Still in Terminal 1, start the Node.js server:
```bash
# Start the Express server and Yjs WebSocket
npm run dev
```
*(Runs on `http://localhost:5000`)*

### Step 3: ML Microservice Launch
In Terminal 2, set up the Python virtual environment and run FastAPI:
```bash
# Navigate to ml_service
cd ml_service

# Create virtual environment
python -m venv .venv

# Activate virtual environment
# On Windows (PowerShell):
.\.venv\Scripts\Activate.ps1
# On Mac/Linux:
# source .venv/bin/activate

# Install requirements
pip install -r requirements.txt

# Start the FastAPI server
python -m uvicorn main:app --reload
```
*(Runs on `http://localhost:8000`)*

### Step 4: Frontend UI Launch
In Terminal 3, install and run the Vite client:
```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start the Vite development server
npm run dev
```
*(Runs on `http://localhost:5173`)*

---

## ✨ Key Features & Capabilities

- **Cold-Chain Inventory Tracking:** Real-time visibility into mission-critical items across polar stations.
- **Offline-First Synchronization:** Yjs CRDT integration allows commanders to make inventory changes while disconnected; mutations safely sync back to the master MongoDB ledger upon reconnection.
- **Automated ML Forecasting:** The Python XGBoost microservice analyzes station weather data (Wind Speed, Pressure Drops) to predict safe transport windows and dynamic stock thresholds.
- **Role-Based Access Control (RBAC):** Distinct interfaces for **Admin** (Global Oversight) and **Commander** (Station-level operations).
- **Secure Requisitions:** End-to-end supply request lifecycle (Draft ➔ Approved ➔ In-Transit ➔ Delivered) with SHA-256 manifest hashing.

---

## 📡 API & Service Endpoints Overview

### Node.js Backend (`http://localhost:5000`)
| Route | Method | Description |
|---|---|---|
| `/api/auth/login` | `POST` | Authenticate user & issue JWT |
| `/api/inventory` | `GET` | Fetch all baseline logistics items |
| `/api/requisitions` | `POST` | Create a new supply requisition |
| `/api/requisitions/:id` | `PUT` | Update requisition status |
| `/api/manifest/seal` | `POST` | Generate SHA-256 seal for manifest |
| `/api/v1/sync/crdt` | `WS/POST` | Yjs CRDT synchronization layer |

### ML Microservice (`http://localhost:8000`)
| Route | Method | Description |
|---|---|---|
| `/health` | `GET` | Check ML engine status |
| `/predict-window` | `GET` | Query transport safety probabilities using environmental inputs |

---

## 🆘 Troubleshooting & FAQ

**1. MongoDB Connection Timeout / Auth Errors**
- Ensure your IP address is whitelisted in MongoDB Atlas (`0.0.0.0/0` for universal access during hackathons).
- Double-check the `MONGO_URI` password (remove the `< >` brackets).

**2. Virtual Environment Execution Policy (Windows)**
- If PowerShell blocks the activation of the `.venv`:
  ```powershell
  Set-ExecutionPolicy Bypass -Scope Process
  ```

**3. Port Conflicts (`EADDRINUSE`)**
- If ports `5000`, `8000`, or `5173` are occupied, kill the blocking processes or modify the ports in `.env` and `vite.config.js` respectively.

**4. ML Model Not Found**
- If the Python API returns a "Model not loaded" error, run `python train_model.py` inside `ml_service/` to generate the `xgboost_model.joblib` binary.
