CREATE TABLE IF NOT EXISTS "CrdtSnapshot" (
    "id" SERIAL PRIMARY KEY,
    "doc_id" TEXT UNIQUE NOT NULL,
    "state" BYTEA,
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "User" (
    "id" SERIAL PRIMARY KEY,
    "username" TEXT UNIQUE NOT NULL,
    "password_hash" TEXT,
    "name" TEXT,
    "role" TEXT DEFAULT 'commander',
    "station" TEXT,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Expedition" (
    "id" SERIAL PRIMARY KEY,
    "expedition_id" TEXT UNIQUE NOT NULL,
    "name" TEXT,
    "season" TEXT,
    "start_date" TIMESTAMP WITH TIME ZONE,
    "end_date" TIMESTAMP WITH TIME ZONE,
    "milestones" JSONB,
    "budget" JSONB,
    "charter_schedule" JSONB,
    "budget_allocation" JSONB,
    "status" TEXT DEFAULT 'Planning'
);

CREATE TABLE IF NOT EXISTS "Roster" (
    "id" SERIAL PRIMARY KEY,
    "personnel_id" TEXT UNIQUE NOT NULL,
    "name" TEXT,
    "role" TEXT,
    "specialization" TEXT,
    "team" TEXT,
    "expedition_id" TEXT,
    "blood_type" TEXT,
    "allergies" TEXT,
    "station" TEXT
);

CREATE TABLE IF NOT EXISTS "Geofence" (
    "id" SERIAL PRIMARY KEY,
    "geofence_id" TEXT UNIQUE NOT NULL,
    "name" TEXT,
    "type" TEXT DEFAULT 'crevasse',
    "coordinates" JSONB,
    "station" TEXT,
    "active" BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS "Item" (
    "id" SERIAL PRIMARY KEY,
    "item_id" TEXT,
    "name" TEXT,
    "category" TEXT,
    "quantity" DOUBLE PRECISION,
    "unit" TEXT,
    "station" TEXT,
    "critical_threshold" DOUBLE PRECISION,
    "last_updated" TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS "InventoryMovement" (
    "id" SERIAL PRIMARY KEY,
    "client_event_id" TEXT UNIQUE,
    "station" TEXT NOT NULL,
    "item_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "unit" TEXT,
    "quantity_delta" DOUBLE PRECISION NOT NULL,
    "stock_after" DOUBLE PRECISION NOT NULL,
    "critical_threshold" DOUBLE PRECISION,
    "lead_time_days" INTEGER,
    "unit_cost" DOUBLE PRECISION,
    "movement_type" TEXT NOT NULL,
    "event_type" TEXT,
    "recorded_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "idx_inventory_movement_station" ON "InventoryMovement"("station");
CREATE INDEX IF NOT EXISTS "idx_inventory_movement_item_id" ON "InventoryMovement"("item_id");
CREATE INDEX IF NOT EXISTS "idx_inventory_movement_recorded_at" ON "InventoryMovement"("recorded_at");

CREATE TABLE IF NOT EXISTS "Requisition" (
    "id" SERIAL PRIMARY KEY,
    "requisition_id" TEXT UNIQUE NOT NULL,
    "station" TEXT NOT NULL,
    "item" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" TEXT,
    "urgency" TEXT DEFAULT 'ROUTINE',
    "status" TEXT DEFAULT 'PENDING_APPROVAL',
    "decided_by" TEXT,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "idx_requisition_station" ON "Requisition"("station");
CREATE INDEX IF NOT EXISTS "idx_requisition_created_at" ON "Requisition"("created_at");

CREATE TABLE IF NOT EXISTS "Manifest" (
    "id" SERIAL PRIMARY KEY,
    "manifest_id" TEXT UNIQUE NOT NULL,
    "status" TEXT DEFAULT 'Draft',
    "items" JSONB NOT NULL,
    "destination" TEXT,
    "vessel" TEXT,
    "vessel_mmsi" TEXT,
    "crypto_hash" TEXT,
    "sealed_at" TIMESTAMP WITH TIME ZONE,
    "sealed_payload_json" TEXT,
    "tamper_detected" BOOLEAN DEFAULT false,
    "tamper_alerts" JSONB DEFAULT '[]'::jsonb,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Telemetry" (
    "id" SERIAL PRIMARY KEY,
    "node_id" TEXT,
    "personnel_id" TEXT,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "battery_pct" DOUBLE PRECISION,
    "status" TEXT,
    "timestamp" TIMESTAMP WITH TIME ZONE
);
