# F.R.O.S.T Backend API

The backend serves as the centralized source of truth, orchestration layer, and WebSocket broker for F.R.O.S.T. 

## Architecture

* **Runtime:** Node.js (v18+) with Express.js.
* **Database:** PostgreSQL (with Prisma ORM maps).
* **Real-time Sync:** `y-websocket` integrated directly into the HTTP server via upgrade requests (`/crdt`).
* **Auth:** Stateless JWT authentication and Role-Based Access Control (RBAC).

## Getting Started

1. **Install Dependencies:**
   ```bash
   npm install
   ```
2. **Environment Variables:** Create a `.env` file containing:
   ```env
   PORT=5000
   DATABASE_URL=postgresql://user:password@localhost:5432/frost_db
   ML_URL=http://localhost:8000
   JWT_SECRET=your_super_secret_key
   ```
3. **Initialize Database:**
   ```bash
   npx prisma db push
   # OR run the provided init.sql against your PG instance
   ```
4. **Run Server:**
   ```bash
   npm run dev
   ```

## Database Structure (PostgreSQL)

The system relies on a strictly typed relational schema (reverse-engineered from the legacy NoSQL implementation):

* **Users/Roles:** `User` table (Admin vs Commander logic).
* **Inventory & Requisitions:** 
  * `Item`: Core catalog.
  * `InventoryMovement`: Ledger of all deltas (consumption, restock, adjustment).
  * `Requisition`: Asset request workflow.
* **Logistics & Cargo:** 
  * `Manifest`: Vessel shipments containing crypto-hashed payload tracking.
* **Expeditions & Safety:**
  * `Expedition`, `Roster`, `Geofence`, `Telemetry` for personnel and zone tracking.
* **CRDT:**
  * `CrdtSnapshot`: Binary `BYTEA` storage of the aggregated Yjs state.

## Core REST Endpoints

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/v1/auth/login` | `POST` | Authenticate user and return JWT |
| `/api/v1/sync/crdt` | `POST` | REST fallback for CRDT updates |
| `/api/v1/inventory/movements` | `POST` | Submit offline-queued inventory changes |
| `/api/v1/inventory/forecast` | `GET` | Get stock runway and depletion estimates |
| `/api/v1/requisitions` | `GET/POST` | Manage edge-node asset requests |
| `/api/v1/cargo/manifest` | `GET/POST` | Cargo ledgers and tamper sealing |
| `/api/v1/ml/predict-window` | `GET` | Proxy to Python ML service for weather safety |

*Note: WebSocket connections are exposed on `ws://<host>/crdt` for live document merging.*
