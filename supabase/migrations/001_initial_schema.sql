-- =============================================================================
-- tskPay Database Schema (Fixed for Supabase SQL Editor)
-- =============================================================================

-- UUIDs: gen_random_uuid() needs pgcrypto
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- Core Tables
-- =============================================================================

-- Parents (Starši)
CREATE TABLE IF NOT EXISTS parents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name  TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  iban  TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_parents_name  ON parents(first_name, last_name);
CREATE INDEX IF NOT EXISTS idx_parents_email ON parents(email) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_parents_iban  ON parents(iban)  WHERE iban  IS NOT NULL;

-- Coaches (Trenerji)
CREATE TABLE IF NOT EXISTS coaches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name  TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_coaches_name ON coaches(name);

-- Groups (Trenerske skupine)
CREATE TABLE IF NOT EXISTS groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  coach_id UUID NOT NULL REFERENCES coaches(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_groups_coach ON groups(coach_id);

-- Members (Tekmovalci)
CREATE TABLE IF NOT EXISTS members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name  TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'inactive', 'archived')),
  notes TEXT DEFAULT '',
  parent_id UUID NOT NULL REFERENCES parents(id) ON DELETE RESTRICT,
  group_id  UUID NOT NULL REFERENCES groups(id)  ON DELETE RESTRICT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_members_parent ON members(parent_id);
CREATE INDEX IF NOT EXISTS idx_members_group  ON members(group_id);
CREATE INDEX IF NOT EXISTS idx_members_status ON members(status);
CREATE INDEX IF NOT EXISTS idx_members_name   ON members(first_name, last_name);

-- Cost Types (Vrste stroškov)
CREATE TABLE IF NOT EXISTS cost_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cost_types_name ON cost_types(name);

-- Costs (Stroški)
CREATE TABLE IF NOT EXISTS costs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE RESTRICT,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
  cost_type_id UUID NOT NULL REFERENCES cost_types(id) ON DELETE RESTRICT,
  due_date DATE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'paid', 'cancelled')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_costs_member    ON costs(member_id);
CREATE INDEX IF NOT EXISTS idx_costs_status    ON costs(status);
CREATE INDEX IF NOT EXISTS idx_costs_cost_type ON costs(cost_type_id);
CREATE INDEX IF NOT EXISTS idx_costs_due_date  ON costs(due_date) WHERE due_date IS NOT NULL;

-- Bank Statements (Bančni izpiski)
CREATE TABLE IF NOT EXISTS bank_statements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('pdf', 'xml')),
  imported_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL CHECK (status IN ('processing', 'completed', 'failed')) DEFAULT 'processing',
  total_transactions INTEGER DEFAULT 0,
  matched_transactions INTEGER DEFAULT 0,
  unmatched_transactions INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bank_statements_status   ON bank_statements(status);
CREATE INDEX IF NOT EXISTS idx_bank_statements_imported ON bank_statements(imported_at);

-- Payments (Plačila)
-- NOTE: we keep only ONE direction between payments and bank_transactions
-- payments.bank_transaction_id -> bank_transactions.id
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL REFERENCES parents(id) ON DELETE RESTRICT,
  amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
  payment_date DATE NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('bank_transfer', 'cash', 'card', 'other')),
  reference_number TEXT,
  notes TEXT DEFAULT '',
  imported_from_bank BOOLEAN DEFAULT FALSE,
  bank_transaction_id UUID, -- FK added after bank_transactions exists
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_parent    ON payments(parent_id);
CREATE INDEX IF NOT EXISTS idx_payments_date      ON payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_payments_reference ON payments(reference_number) WHERE reference_number IS NOT NULL;

-- Bank Transactions (Bančne transakcije)
-- NOTE: removed bank_transactions.payment_id to avoid circular FK
CREATE TABLE IF NOT EXISTS bank_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_statement_id UUID NOT NULL REFERENCES bank_statements(id) ON DELETE CASCADE,
  transaction_date DATE NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  description TEXT NOT NULL,
  reference TEXT,
  account_number TEXT NOT NULL,
  payer_name TEXT NOT NULL,
  bank_reference TEXT,
  matched_parent_id UUID REFERENCES parents(id) ON DELETE SET NULL,
  match_confidence TEXT CHECK (match_confidence IN ('high', 'medium', 'low')),
  status TEXT NOT NULL CHECK (status IN ('matched', 'unmatched', 'confirmed')) DEFAULT 'unmatched',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bank_transactions_statement  ON bank_transactions(bank_statement_id);
CREATE INDEX IF NOT EXISTS idx_bank_transactions_parent     ON bank_transactions(matched_parent_id) WHERE matched_parent_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_bank_transactions_status     ON bank_transactions(status);
CREATE INDEX IF NOT EXISTS idx_bank_transactions_date       ON bank_transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_bank_transactions_reference  ON bank_transactions(reference) WHERE reference IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_bank_transactions_account    ON bank_transactions(account_number);
CREATE INDEX IF NOT EXISTS idx_bank_transactions_payer_name ON bank_transactions(payer_name);

-- Add FK payments.bank_transaction_id now that bank_transactions exists
ALTER TABLE payments
  ADD CONSTRAINT payments_bank_transaction_id_fkey
  FOREIGN KEY (bank_transaction_id) REFERENCES bank_transactions(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_payments_bank_transaction
  ON payments(bank_transaction_id) WHERE bank_transaction_id IS NOT NULL;

-- Payment Allocations (Povezava plačil in stroškov)
CREATE TABLE IF NOT EXISTS payment_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
  cost_id UUID NOT NULL REFERENCES costs(id) ON DELETE RESTRICT,
  allocated_amount DECIMAL(10, 2) NOT NULL CHECK (allocated_amount > 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(payment_id, cost_id)
);

CREATE INDEX IF NOT EXISTS idx_payment_allocations_payment ON payment_allocations(payment_id);
CREATE INDEX IF NOT EXISTS idx_payment_allocations_cost    ON payment_allocations(cost_id);

-- Audit Log
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL CHECK (action IN ('bulk_billing', 'import_confirmed', 'cost_cancelled', 'cost_created', 'cost_updated', 'payment_created')),
  description TEXT NOT NULL,
  user_id UUID,
  user_name TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  details JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_audit_log_action    ON audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_log_timestamp ON audit_log(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_log_user      ON audit_log(user_id) WHERE user_id IS NOT NULL;

-- =============================================================================
-- Triggers
-- =============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_parents_updated_at        BEFORE UPDATE ON parents        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_coaches_updated_at        BEFORE UPDATE ON coaches        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_groups_updated_at         BEFORE UPDATE ON groups         FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_members_updated_at        BEFORE UPDATE ON members        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_costs_updated_at          BEFORE UPDATE ON costs          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bank_statements_updated_atBEFORE UPDATE ON bank_statementsFOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bank_transactions_updated_at BEFORE UPDATE ON bank_transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at       BEFORE UPDATE ON payments       FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Cost status update on allocation
CREATE OR REPLACE FUNCTION update_cost_status_on_allocation()
RETURNS TRIGGER AS $$
DECLARE
  total_allocated DECIMAL(10, 2);
  cost_amount DECIMAL(10, 2);
BEGIN
  SELECT COALESCE(SUM(allocated_amount), 0) INTO total_allocated
  FROM payment_allocations
  WHERE cost_id = NEW.cost_id;

  SELECT amount INTO cost_amount
  FROM costs
  WHERE id = NEW.cost_id;

  IF total_allocated >= cost_amount THEN
    UPDATE costs
    SET status = 'paid'
    WHERE id = NEW.cost_id AND status = 'pending';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_cost_status_on_allocation
  AFTER INSERT OR UPDATE ON payment_allocations
  FOR EACH ROW
  EXECUTE FUNCTION update_cost_status_on_allocation();

-- Cost status update on deallocation
CREATE OR REPLACE FUNCTION update_cost_status_on_deallocation()
RETURNS TRIGGER AS $$
DECLARE
  total_allocated DECIMAL(10, 2);
  cost_amount DECIMAL(10, 2);
BEGIN
  SELECT COALESCE(SUM(allocated_amount), 0) INTO total_allocated
  FROM payment_allocations
  WHERE cost_id = OLD.cost_id;

  SELECT amount INTO cost_amount
  FROM costs
  WHERE id = OLD.cost_id;

  IF total_allocated < cost_amount THEN
    UPDATE costs
    SET status = 'pending'
    WHERE id = OLD.cost_id AND status = 'paid';
  END IF;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_cost_status_on_deallocation
  AFTER DELETE ON payment_allocations
  FOR EACH ROW
  EXECUTE FUNCTION update_cost_status_on_deallocation();

-- =============================================================================
-- Row Level Security (RLS)
-- =============================================================================

ALTER TABLE parents            ENABLE ROW LEVEL SECURITY;
ALTER TABLE coaches            ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups             ENABLE ROW LEVEL SECURITY;
ALTER TABLE members            ENABLE ROW LEVEL SECURITY;
ALTER TABLE cost_types         ENABLE ROW LEVEL SECURITY;
ALTER TABLE costs              ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_statements    ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_transactions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments           ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log          ENABLE ROW LEVEL SECURITY;

-- Allow all ONLY for authenticated users (dev-friendly)
CREATE POLICY "Enable all for authenticated users" ON parents
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Enable all for authenticated users" ON coaches
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Enable all for authenticated users" ON groups
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Enable all for authenticated users" ON members
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Enable all for authenticated users" ON cost_types
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Enable all for authenticated users" ON costs
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Enable all for authenticated users" ON bank_statements
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Enable all for authenticated users" ON bank_transactions
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Enable all for authenticated users" ON payments
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Enable all for authenticated users" ON payment_allocations
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Enable all for authenticated users" ON audit_log
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- =============================================================================
-- Seed Data
-- =============================================================================

INSERT INTO cost_types (name) VALUES
  ('Vadnine'),
  ('Oprema'),
  ('Članarine'),
  ('Priprave'),
  ('Modre kartice'),
  ('Zdravniški pregledi')
ON CONFLICT (name) DO NOTHING;

-- =============================================================================
-- Views
-- =============================================================================

CREATE OR REPLACE VIEW member_obligations AS
SELECT
  m.id AS member_id,
  m.first_name || ' ' || m.last_name AS member_name,
  p.id AS parent_id,
  p.first_name || ' ' || p.last_name AS parent_name,
  g.id AS group_id,
  g.name AS group_name,
  m.status,
  COALESCE(SUM(CASE WHEN c.status = 'pending' THEN c.amount ELSE 0 END), 0) AS balance,
  COUNT(CASE WHEN c.status = 'pending' THEN 1 END) AS open_items_count,
  COUNT(CASE WHEN c.status = 'pending' AND c.due_date < CURRENT_DATE THEN 1 END) AS overdue_items_count,
  COALESCE(SUM(CASE WHEN c.status = 'pending' AND c.due_date < CURRENT_DATE THEN c.amount ELSE 0 END), 0) AS overdue_amount
FROM members m
JOIN parents p ON m.parent_id = p.id
JOIN groups g  ON m.group_id  = g.id
LEFT JOIN costs c ON c.member_id = m.id
GROUP BY
  m.id, m.first_name, m.last_name,
  p.id, p.first_name, p.last_name,
  g.id, g.name,
  m.status;
