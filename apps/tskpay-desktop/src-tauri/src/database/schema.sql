-- =============================================================================
-- tskPay SQLite Database Schema
-- =============================================================================

-- Enable foreign keys
PRAGMA foreign_keys = ON;

-- =============================================================================
-- Core Tables
-- =============================================================================

-- Parents (Starši)
CREATE TABLE IF NOT EXISTS parents (
  id TEXT PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  iban TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_parents_name ON parents(first_name, last_name);
CREATE INDEX IF NOT EXISTS idx_parents_email ON parents(email) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_parents_iban ON parents(iban) WHERE iban IS NOT NULL;

-- Coaches (Trenerji)
CREATE TABLE IF NOT EXISTS coaches (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_coaches_name ON coaches(name);

-- Groups (Trenerske skupine)
CREATE TABLE IF NOT EXISTS groups (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  coach_id TEXT NOT NULL REFERENCES coaches(id) ON DELETE RESTRICT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_groups_coach ON groups(coach_id);

-- Members (Tekmovalci)
CREATE TABLE IF NOT EXISTS members (
  id TEXT PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'inactive', 'archived')),
  notes TEXT DEFAULT '',
  parent_id TEXT NOT NULL REFERENCES parents(id) ON DELETE RESTRICT,
  group_id TEXT NOT NULL REFERENCES groups(id) ON DELETE RESTRICT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_members_parent ON members(parent_id);
CREATE INDEX IF NOT EXISTS idx_members_group ON members(group_id);
CREATE INDEX IF NOT EXISTS idx_members_status ON members(status);
CREATE INDEX IF NOT EXISTS idx_members_name ON members(first_name, last_name);

-- Cost Types (Vrste stroškov)
CREATE TABLE IF NOT EXISTS cost_types (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_cost_types_name ON cost_types(name);

-- Costs (Stroški)
CREATE TABLE IF NOT EXISTS costs (
  id TEXT PRIMARY KEY,
  member_id TEXT NOT NULL REFERENCES members(id) ON DELETE RESTRICT,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  amount REAL NOT NULL CHECK (amount > 0),
  cost_type_id TEXT NOT NULL REFERENCES cost_types(id) ON DELETE RESTRICT,
  due_date TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending', 'paid', 'cancelled')) DEFAULT 'pending',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  -- Ponavljajoči stroški
  is_recurring INTEGER DEFAULT 0,
  recurring_period TEXT CHECK (recurring_period IN ('monthly', 'yearly', 'weekly', 'quarterly')),
  recurring_start_date TEXT,
  recurring_end_date TEXT,
  recurring_day_of_month INTEGER,
  recurring_template_id TEXT REFERENCES costs(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_costs_member ON costs(member_id);
CREATE INDEX IF NOT EXISTS idx_costs_status ON costs(status);
CREATE INDEX IF NOT EXISTS idx_costs_cost_type ON costs(cost_type_id);
CREATE INDEX IF NOT EXISTS idx_costs_due_date ON costs(due_date) WHERE due_date IS NOT NULL;

-- Bank Statements (Bančni izpiski)
CREATE TABLE IF NOT EXISTS bank_statements (
  id TEXT PRIMARY KEY,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('pdf', 'xml')),
  imported_at TEXT NOT NULL DEFAULT (datetime('now')),
  status TEXT NOT NULL CHECK (status IN ('processing', 'completed', 'failed')) DEFAULT 'processing',
  total_transactions INTEGER DEFAULT 0,
  matched_transactions INTEGER DEFAULT 0,
  unmatched_transactions INTEGER DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_bank_statements_status ON bank_statements(status);
CREATE INDEX IF NOT EXISTS idx_bank_statements_imported ON bank_statements(imported_at);

-- Payments (Plačila)
CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  parent_id TEXT NOT NULL REFERENCES parents(id) ON DELETE RESTRICT,
  amount REAL NOT NULL CHECK (amount > 0),
  payment_date TEXT NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('bank_transfer', 'cash', 'card', 'other')),
  reference_number TEXT,
  notes TEXT DEFAULT '',
  imported_from_bank INTEGER NOT NULL DEFAULT 0,
  bank_transaction_id TEXT REFERENCES bank_transactions(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_payments_parent ON payments(parent_id);
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_payments_reference ON payments(reference_number) WHERE reference_number IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_payments_bank_transaction ON payments(bank_transaction_id) WHERE bank_transaction_id IS NOT NULL;

-- Bank Transactions (Bančne transakcije)
CREATE TABLE IF NOT EXISTS bank_transactions (
  id TEXT PRIMARY KEY,
  bank_statement_id TEXT NOT NULL REFERENCES bank_statements(id) ON DELETE CASCADE,
  transaction_date TEXT NOT NULL,
  amount REAL NOT NULL,
  description TEXT NOT NULL,
  reference TEXT,
  account_number TEXT NOT NULL,
  payer_name TEXT NOT NULL,
  bank_reference TEXT,
  matched_parent_id TEXT REFERENCES parents(id) ON DELETE SET NULL,
  match_confidence TEXT CHECK (match_confidence IN ('high', 'medium', 'low')),
  status TEXT NOT NULL CHECK (status IN ('matched', 'unmatched', 'confirmed')) DEFAULT 'unmatched',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_bank_transactions_statement ON bank_transactions(bank_statement_id);
CREATE INDEX IF NOT EXISTS idx_bank_transactions_parent ON bank_transactions(matched_parent_id) WHERE matched_parent_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_bank_transactions_status ON bank_transactions(status);
CREATE INDEX IF NOT EXISTS idx_bank_transactions_date ON bank_transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_bank_transactions_reference ON bank_transactions(reference) WHERE reference IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_bank_transactions_account ON bank_transactions(account_number);
CREATE INDEX IF NOT EXISTS idx_bank_transactions_payer_name ON bank_transactions(payer_name);

-- Payment Allocations (Povezava plačil in stroškov)
CREATE TABLE IF NOT EXISTS payment_allocations (
  id TEXT PRIMARY KEY,
  payment_id TEXT NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
  cost_id TEXT NOT NULL REFERENCES costs(id) ON DELETE RESTRICT,
  allocated_amount REAL NOT NULL CHECK (allocated_amount > 0),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(payment_id, cost_id)
);

CREATE INDEX IF NOT EXISTS idx_payment_allocations_payment ON payment_allocations(payment_id);
CREATE INDEX IF NOT EXISTS idx_payment_allocations_cost ON payment_allocations(cost_id);

-- Audit Log
CREATE TABLE IF NOT EXISTS audit_log (
  id TEXT PRIMARY KEY,
  action TEXT NOT NULL CHECK (action IN ('bulk_billing', 'import_confirmed', 'cost_cancelled', 'cost_created', 'cost_updated', 'payment_created')),
  description TEXT NOT NULL,
  user_id TEXT,
  user_name TEXT,
  timestamp TEXT NOT NULL DEFAULT (datetime('now')),
  details TEXT DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_audit_log_action ON audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_log_timestamp ON audit_log(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_log_user ON audit_log(user_id) WHERE user_id IS NOT NULL;

-- =============================================================================
-- Triggers for updated_at
-- =============================================================================

CREATE TRIGGER IF NOT EXISTS update_parents_updated_at
  AFTER UPDATE ON parents
  FOR EACH ROW
BEGIN
  UPDATE parents SET updated_at = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_coaches_updated_at
  AFTER UPDATE ON coaches
  FOR EACH ROW
BEGIN
  UPDATE coaches SET updated_at = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_groups_updated_at
  AFTER UPDATE ON groups
  FOR EACH ROW
BEGIN
  UPDATE groups SET updated_at = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_members_updated_at
  AFTER UPDATE ON members
  FOR EACH ROW
BEGIN
  UPDATE members SET updated_at = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_costs_updated_at
  AFTER UPDATE ON costs
  FOR EACH ROW
BEGIN
  UPDATE costs SET updated_at = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_bank_statements_updated_at
  AFTER UPDATE ON bank_statements
  FOR EACH ROW
BEGIN
  UPDATE bank_statements SET updated_at = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_bank_transactions_updated_at
  AFTER UPDATE ON bank_transactions
  FOR EACH ROW
BEGIN
  UPDATE bank_transactions SET updated_at = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_payments_updated_at
  AFTER UPDATE ON payments
  FOR EACH ROW
BEGIN
  UPDATE payments SET updated_at = datetime('now') WHERE id = NEW.id;
END;

-- =============================================================================
-- Trigger for cost status update on allocation
-- =============================================================================

CREATE TRIGGER IF NOT EXISTS trigger_update_cost_status_on_allocation
  AFTER INSERT ON payment_allocations
  FOR EACH ROW
BEGIN
  UPDATE costs
  SET status = 'paid'
  WHERE id = NEW.cost_id
    AND status = 'pending'
    AND (SELECT COALESCE(SUM(allocated_amount), 0) FROM payment_allocations WHERE cost_id = NEW.cost_id) >= (SELECT amount FROM costs WHERE id = NEW.cost_id);
END;

CREATE TRIGGER IF NOT EXISTS trigger_update_cost_status_on_deallocation
  AFTER DELETE ON payment_allocations
  FOR EACH ROW
BEGIN
  UPDATE costs
  SET status = 'pending'
  WHERE id = OLD.cost_id
    AND status = 'paid'
    AND (SELECT COALESCE(SUM(allocated_amount), 0) FROM payment_allocations WHERE cost_id = OLD.cost_id) < (SELECT amount FROM costs WHERE id = OLD.cost_id);
END;

-- =============================================================================
-- Seed Data
-- =============================================================================

INSERT OR IGNORE INTO cost_types (id, name) VALUES
  ('ct-vadnine', 'Vadnine'),
  ('ct-oprema', 'Oprema'),
  ('ct-clanarine', 'Članarine'),
  ('ct-priprave', 'Priprave'),
  ('ct-modre-kartice', 'Modre kartice'),
  ('ct-zdravniski', 'Zdravniški pregledi');
