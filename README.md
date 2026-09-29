<div align="center">
  <h1>❄️ F.R.O.S.T</h1>
  <p><b>Polar Logistics Command</b></p>
  <p>Tactical logistics, cold-chain inventory tracking, and real-time research station monitoring for extreme environments.</p>
  
  <div>
    <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
    <img src="https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
    <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
    <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  </div>
</div>

---

## 🚀 Active Features

- **3-Column Dynamic Station Overview:** Seamless admin dashboards managing polar stations (Maitri, Bharati, Himadri) with responsive flex-grid layouts.
- **Real-Time Meteorological Telemetry:** Deep integration with the Open-Meteo REST API, streaming live surface temperature, wind speed, relative humidity, atmospheric pressure, and visibility straight to operational cards.
- **Dynamic Personnel Rosters:** Direct MongoDB aggregation pipelines powering the "Active Rosters" interface, gracefully rendering tactical empty-states when stations are vacant.
- **Simulated High-Frequency Radar:** A real-time telemetry array rendering live operational nodes using Recharts and responsive containers.
- **Collaborative State Sync:** Utilizing Yjs (CRDT) for conflict-free, real-time localized state synchronization across the logistics network.

## 📂 Project Structure

The architecture is divided into three primary microservices:

```ascii
F.R.O.S.T/
├── backend/               # Node.js + Express API Orchestrator
│   ├── controllers/
│   ├── models/            # Mongoose Schemas (User, Item, Requisition, Manifest)
│   ├── routes/
│   └── server.js
├── frontend/              # React + Vite Client
│   ├── src/
│   │   ├── components/    # Reusable UI (Navbars, Modals)
│   │   ├── pages/         # Admin & Commander Dashboards
│   │   └── utils/         # Yjs store configurations
│   └── package.json
└── ml_service/            # Python Microservice
    ├── main.py            # FastAPI / Uvicorn server
    └── requirements.txt
```

## 🛠️ Zero-to-Hero Local Setup Guide

Follow this sequential setup to deploy F.R.O.S.T flawlessly on your local machine. 

**Prerequisites:** 
- Node.js (v18+)
- Python (v3.10+)
- Git

### Step 1: Environment Configuration
Create a `.env` file inside the `backend/` directory. You will need to provide your MongoDB Atlas connection string.

```bash
# backend/.env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/frost?retryWrites=true&w=majority
```

### Step 2: Backend Initialization
Open a terminal, navigate to the backend, install the dependencies, and ignite the Express server.

```bash
cd backend
npm install
npm run dev
```

### Step 3: Frontend Initialization
Open a second terminal instance to deploy the Vite React application.

```bash
cd frontend
npm install
npm run dev
```

### Step 4: ML Service Initialization
Open a third terminal instance to boot up the Python microservice.

```bash
cd ml_service

# Create virtual environment
python -m venv venv

# Activate virtual environment
# --> For Windows:
.\venv\Scripts\activate
# --> For Mac/Linux:
source venv/bin/activate

# Install requirements and run server
pip install -r requirements.txt
python -m uvicorn main:app --reload
```

## 🗄️ API & Database Reference

F.R.O.S.T is backed by a robust MongoDB Atlas schema designed for supply chain immutability:

- **`Users`**: Operational personnel, tracking `role`, `station`, and `status`.
- **`Items`**: Core cold-chain inventory tracking quantities, units, and critical thresholds.
- **`Requisitions`**: Internal base-to-base supply requests.
- **`Manifests`**: High-level cargo shipment ledgers for global transit.

### Primary Express Routes (`backend/server.js`)
- `GET /api/v1/research-centers` : Hydrates the main F.R.O.S.T admin overview grid.
- `GET /api/v1/research-centers/:id` : Deep-fetches station-specific analytics and calculates localized inventory metrics.
- `GET /api/stations/:stationName/roster` : Performs regex aggregations on the `Users` collection to stream live personnel deployments.

## 🤝 Contributing Guidelines

We welcome pull requests from the community to help stabilize polar logistics!

1. **Fork the Repository**
2. **Create a Feature Branch:** `git checkout -b feature/tactical-radar-update`
3. **Commit your Changes:** `git commit -m 'Add new radar ping animation'`
4. **Push to the Branch:** `git push origin feature/tactical-radar-update`
5. **Open a Pull Request** ensuring your code adheres to existing Tailwind styles and doesn't break Yjs synchronization flows.
