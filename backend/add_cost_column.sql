-- Add resolution_cost column to issues table
ALTER TABLE issues ADD COLUMN IF NOT EXISTS resolution_cost DECIMAL(10,2);

-- Add cost column to service_records table if it doesn't exist
ALTER TABLE service_records ADD COLUMN IF NOT EXISTS service_cost DECIMAL(10,2);