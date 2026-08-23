/*
# Repair Shop Management Schema

This migration creates the core data model for a Mobile/PC Repair Shop
Management System. The app has no login screen, so it is treated as a
single-tenant, shared workspace: any counter staff member using the app
can read and write all records (RLS policies below are scoped to the
`anon` and `authenticated` roles with an open predicate on purpose).

## 1. New Tables

### `clients`
Stores registered customers.
- `id` (uuid, primary key)
- `name` (text) - client full name
- `whatsapp` (text) - contact number used for WhatsApp outreach
- `cpf` (text) - Brazilian tax id, optional
- `address` (text) - optional mailing/service address
- `created_at` (timestamptz)

### `work_orders`
Stores each repair ticket ("OS" - Ordem de Serviço) opened at the counter.
- `id` (uuid, primary key)
- `client_id` (uuid, references `clients`, nullable so history survives client removal)
- `device_model` (text) - e.g. "iPhone 11"
- `imei_serial` (text) - device identifier
- `reported_fault` (text) - what the client says is wrong
- `estimated_price` (numeric) - quoted repair price
- `status` (text) - one of pending / evaluating / approved / ready / delivered
- `checklist` (jsonb) - entry inspection results (touchscreen, wifi, cameras, biometrics, scratches, power)
- `pattern_lock` (jsonb) - ordered list of dot indices (0-8) if the client shared an Android pattern
- `created_at`, `updated_at` (timestamptz)

### `supplier_quotes`
Stores supplier price quotes for parts, used for price comparison at the counter.
- `id` (uuid, primary key)
- `supplier_name` (text)
- `part_name` (text) - e.g. "Screen Assembly"
- `device_model` (text) - e.g. "Moto G8"
- `quality_type` (text) - Original / Incell / OLED / Compatible
- `cost_price` (numeric)
- `in_stock` (boolean)
- `whatsapp` (text) - supplier contact number for the "Contact via WhatsApp" action
- `created_at` (timestamptz)

## 2. Security
Row Level Security is enabled on all three tables. Since this application has
no authentication, every policy grants access to both `anon` and
`authenticated` roles so the browser (using the public anon key) can operate
normally. This is intentional shared-data access, not an oversight.

## 3. Indexes
Added on foreign keys and frequently filtered columns (`work_orders.status`,
`work_orders.client_id`, `supplier_quotes.device_model`) to keep counter
lookups fast.
*/

CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  whatsapp text NOT NULL,
  cpf text DEFAULT '',
  address text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS work_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE SET NULL,
  device_model text NOT NULL,
  imei_serial text DEFAULT '',
  reported_fault text NOT NULL DEFAULT '',
  estimated_price numeric(10,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'evaluating', 'approved', 'ready', 'delivered')),
  checklist jsonb NOT NULL DEFAULT '{}'::jsonb,
  pattern_lock jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS supplier_quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_name text NOT NULL,
  part_name text NOT NULL,
  device_model text NOT NULL,
  quality_type text NOT NULL CHECK (quality_type IN ('Original', 'Incell', 'OLED', 'Compatible')),
  cost_price numeric(10,2) NOT NULL DEFAULT 0,
  in_stock boolean NOT NULL DEFAULT true,
  whatsapp text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_work_orders_client_id ON work_orders(client_id);
CREATE INDEX IF NOT EXISTS idx_work_orders_status ON work_orders(status);
CREATE INDEX IF NOT EXISTS idx_supplier_quotes_device_model ON supplier_quotes(device_model);

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_quotes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_clients" ON clients;
CREATE POLICY "anon_select_clients" ON clients FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_clients" ON clients;
CREATE POLICY "anon_insert_clients" ON clients FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_clients" ON clients;
CREATE POLICY "anon_update_clients" ON clients FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_clients" ON clients;
CREATE POLICY "anon_delete_clients" ON clients FOR DELETE
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_select_work_orders" ON work_orders;
CREATE POLICY "anon_select_work_orders" ON work_orders FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_work_orders" ON work_orders;
CREATE POLICY "anon_insert_work_orders" ON work_orders FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_work_orders" ON work_orders;
CREATE POLICY "anon_update_work_orders" ON work_orders FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_work_orders" ON work_orders;
CREATE POLICY "anon_delete_work_orders" ON work_orders FOR DELETE
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_select_supplier_quotes" ON supplier_quotes;
CREATE POLICY "anon_select_supplier_quotes" ON supplier_quotes FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_supplier_quotes" ON supplier_quotes;
CREATE POLICY "anon_insert_supplier_quotes" ON supplier_quotes FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_supplier_quotes" ON supplier_quotes;
CREATE POLICY "anon_update_supplier_quotes" ON supplier_quotes FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_supplier_quotes" ON supplier_quotes;
CREATE POLICY "anon_delete_supplier_quotes" ON supplier_quotes FOR DELETE
  TO anon, authenticated USING (true);
