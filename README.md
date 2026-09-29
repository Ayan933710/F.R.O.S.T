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

**F.R.O.S.T** (Field Research & Operational Supply Tracker) is a mission-critical logistics platform built to sustain extreme-environment polar research stations. From predicting localized cold-chain supply exhaustion to orchestrating high-stakes global manifests, F.R.O.S.T provides commanders with a real-time, zero-latency situational awareness dashboard. Designed with a stunning cyber-tactical aesthetic, the platform bridges cutting-edge telemetry tracking with robust inventory ledgers to ensure no researcher is left stranded.

## 🗺️ System Workflow & User Journey

F.R.O.S.T is engineered for two primary operational profiles, ensuring streamlined communication between headquarters and the deep freeze:

- **Global Admin (HQ):** Operates from the macro-level. The Admin dashboard provides a bird's-eye view of all polar assets (Maitri, Bharati, Himadri). HQ oversees global cargo transits, approves life-saving expeditions, manages system-wide inventory allocations, and monitors the overall health of the logistics network.
- **Station Commander (Field):** A hyper-localized, tactical view designed for extreme environments. Commanders monitor live sensor telemetry, track real-time local weather API feeds, manage active station rosters, and submit localized supply requisitions before critical items hit zero.

### The Logistics Lifecycle
1. **Requisition Created:** A Station Commander identifies a critical shortfall (e.g., thermal generators) and issues a requisition.
2. **Manifest Generated:** HQ approves the requisition, packing the items into a global transit manifest.
3. **Deployed:** The cargo enters transit, tracked globally via the F.R.O.S.T ledger.
4. **Inventory Updated:** Upon arrival, the cargo is scanned into the local station's cold-chain inventory via CRDT-synced state updates.

## ⚡ Comprehensive Feature Matrix

### Operational Capabilities
- **Cold-Chain Inventory Tracking:** Precision monitoring of perishable and high-value equipment with automatic low-stock warnings.
- **Role-Based Tactical Dashboards:** Distinct UX/UI flows for Global Admins and Station Commanders, maximizing cognitive focus.
- **Active Personnel Rostering:** Live tracking of deployed scientists and crew complements assigned to each polar station.
- **Predictive Consumption Baselines:** Powered by our dedicated Python ML service to forecast supply exhaustion before it becomes critical.

### Technical Engineering
- **Yjs CRDT Real-Time Synchronization:** Conflict-free, real-time localized state synchronization across the logistics network, ensuring data integrity even during intermittent satellite connections.
- **MongoDB Aggregation Pipelines:** Highly optimized database queries that dynamically calculate cross-station metrics and active rosters.
- **Responsive Mobile-First Tailwind UI:** Fluid, cyber-tactical interface that degrades gracefully into app-like bottom navigation bars for mobile fieldwork.
- **Open-Meteo External API Integrations:** Live meteorological telemetry streaming surface temperature, wind speed, relative humidity, and pressure directly into the operational cards.



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

---

<div align="center">
  <h3>🛡️ Built for Resilience. Engineered for the Extreme.</h3>
  <p><b>Made by Team HackCypher</b></p>
  <p>For inquiries, deployment access, or collaboration, establish a comm-link:</p>
  <a href="mailto:hackcypher2025@gmail.com">
    <img src="https://img.shields.io/badge/Email-hackcypher2025%40gmail.com-D14836?style=for-the-badge&logo=gmail&logoColor=white" alt="Email Team HackCypher" />
  </a>
  <br />
  <br />
  <p><i>"Ensuring 100% mission integrity when connectivity is a luxury."</i></p>
</div>
