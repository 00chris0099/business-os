-- =============================================
-- AI Business OS - Complete Database Schema
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- =============================================
-- SYSTEM SCHEMA
-- =============================================
CREATE SCHEMA IF NOT EXISTS system;
CREATE SCHEMA IF NOT EXISTS crm;
CREATE SCHEMA IF NOT EXISTS erp;
CREATE SCHEMA IF NOT EXISTS ai;
CREATE SCHEMA IF NOT EXISTS automation;
CREATE SCHEMA IF NOT EXISTS analytics;

-- =============================================
-- COMPANIES (Multi-tenant root)
-- =============================================
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  domain VARCHAR(255),
  logo_url TEXT,
  industry VARCHAR(100),
  plan VARCHAR(50) DEFAULT 'starter',
  is_active BOOLEAN DEFAULT true,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- SYSTEM SCHEMA - Auth & RBAC
-- =============================================
CREATE TABLE IF NOT EXISTS system.roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) UNIQUE NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  description TEXT,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS system.permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) UNIQUE NOT NULL,
  resource VARCHAR(50) NOT NULL,
  action VARCHAR(50) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS system.role_permissions (
  role_id UUID REFERENCES system.roles(id) ON DELETE CASCADE,
  permission_id UUID REFERENCES system.permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE IF NOT EXISTS system.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  is_primary_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS system.password_resets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES system.users(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS system.support_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'open',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS system.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES system.users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  entity VARCHAR(50) NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  resource_id VARCHAR(255),
  ip_address INET
);

CREATE TABLE IF NOT EXISTS system.sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES system.users(id) ON DELETE CASCADE,
  token VARCHAR(500) UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- CRM SCHEMA
-- =============================================
CREATE TABLE IF NOT EXISTS crm.clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(30),
  address TEXT,
  city VARCHAR(100),
  country VARCHAR(100),
  industry VARCHAR(100),
  website VARCHAR(255),
  status VARCHAR(50) DEFAULT 'active',
  tags TEXT[],
  custom_fields JSONB DEFAULT '{}',
  assigned_to UUID REFERENCES system.users(id),
  created_by UUID REFERENCES system.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS crm.contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  client_id UUID REFERENCES crm.clients(id) ON DELETE CASCADE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100),
  email VARCHAR(255),
  phone VARCHAR(30),
  position VARCHAR(100),
  department VARCHAR(100),
  is_primary BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS crm.leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(30),
  source VARCHAR(100),
  status VARCHAR(50) DEFAULT 'new',
  score INTEGER DEFAULT 0,
  estimated_value DECIMAL(15, 2),
  currency VARCHAR(10) DEFAULT 'USD',
  notes TEXT,
  assigned_to UUID REFERENCES system.users(id),
  converted_at TIMESTAMPTZ,
  converted_to_client_id UUID REFERENCES crm.clients(id),
  tags TEXT[],
  custom_fields JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS crm.opportunities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  client_id UUID REFERENCES crm.clients(id) ON DELETE SET NULL,
  lead_id UUID REFERENCES crm.leads(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  stage VARCHAR(50) DEFAULT 'qualification',
  probability INTEGER DEFAULT 0,
  value DECIMAL(15, 2),
  currency VARCHAR(10) DEFAULT 'USD',
  expected_close_date DATE,
  closed_at TIMESTAMPTZ,
  closed_reason TEXT,
  assigned_to UUID REFERENCES system.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS crm.activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  description TEXT,
  client_id UUID REFERENCES crm.clients(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES crm.contacts(id) ON DELETE SET NULL,
  lead_id UUID REFERENCES crm.leads(id) ON DELETE SET NULL,
  opportunity_id UUID REFERENCES crm.opportunities(id) ON DELETE SET NULL,
  user_id UUID REFERENCES system.users(id),
  scheduled_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  duration_minutes INTEGER,
  status VARCHAR(30) DEFAULT 'pending',
  outcome TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS crm.notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  client_id UUID REFERENCES crm.clients(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES crm.contacts(id) ON DELETE SET NULL,
  lead_id UUID REFERENCES crm.leads(id) ON DELETE SET NULL,
  opportunity_id UUID REFERENCES crm.opportunities(id) ON DELETE SET NULL,
  user_id UUID REFERENCES system.users(id),
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- ERP SCHEMA
-- =============================================
CREATE TABLE IF NOT EXISTS erp.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  sku VARCHAR(100),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  unit_price DECIMAL(15, 2) NOT NULL DEFAULT 0,
  cost_price DECIMAL(15, 2) DEFAULT 0,
  currency VARCHAR(10) DEFAULT 'USD',
  unit_of_measure VARCHAR(50) DEFAULT 'unit',
  is_active BOOLEAN DEFAULT true,
  image_url TEXT,
  tags TEXT[],
  custom_fields JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(sku, company_id)
);

CREATE TABLE IF NOT EXISTS erp.inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  product_id UUID REFERENCES erp.products(id) ON DELETE CASCADE,
  location VARCHAR(100) DEFAULT 'main',
  quantity DECIMAL(15, 4) DEFAULT 0,
  reserved_quantity DECIMAL(15, 4) DEFAULT 0,
  reorder_level DECIMAL(15, 4) DEFAULT 0,
  max_stock DECIMAL(15, 4),
  last_restock_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, location, company_id)
);

CREATE TABLE IF NOT EXISTS erp.suppliers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(30),
  address TEXT,
  country VARCHAR(100),
  tax_id VARCHAR(100),
  payment_terms VARCHAR(100),
  rating INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS erp.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  order_number VARCHAR(100) UNIQUE NOT NULL,
  type VARCHAR(30) DEFAULT 'sale',
  client_id UUID REFERENCES crm.clients(id) ON DELETE SET NULL,
  supplier_id UUID REFERENCES erp.suppliers(id) ON DELETE SET NULL,
  status VARCHAR(50) DEFAULT 'draft',
  subtotal DECIMAL(15, 2) DEFAULT 0,
  discount_amount DECIMAL(15, 2) DEFAULT 0,
  tax_amount DECIMAL(15, 2) DEFAULT 0,
  total DECIMAL(15, 2) DEFAULT 0,
  currency VARCHAR(10) DEFAULT 'USD',
  notes TEXT,
  shipping_address TEXT,
  expected_delivery DATE,
  delivered_at TIMESTAMPTZ,
  created_by UUID REFERENCES system.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS erp.order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES erp.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES erp.products(id) ON DELETE SET NULL,
  description VARCHAR(255),
  quantity DECIMAL(15, 4) NOT NULL,
  unit_price DECIMAL(15, 2) NOT NULL,
  discount_percent DECIMAL(5, 2) DEFAULT 0,
  total DECIMAL(15, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS erp.invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  invoice_number VARCHAR(100) UNIQUE NOT NULL,
  order_id UUID REFERENCES erp.orders(id) ON DELETE SET NULL,
  client_id UUID REFERENCES crm.clients(id) ON DELETE SET NULL,
  status VARCHAR(30) DEFAULT 'draft',
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,
  subtotal DECIMAL(15, 2) NOT NULL DEFAULT 0,
  tax_amount DECIMAL(15, 2) DEFAULT 0,
  total DECIMAL(15, 2) NOT NULL DEFAULT 0,
  paid_amount DECIMAL(15, 2) DEFAULT 0,
  currency VARCHAR(10) DEFAULT 'USD',
  notes TEXT,
  pdf_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS erp.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  invoice_id UUID REFERENCES erp.invoices(id) ON DELETE SET NULL,
  amount DECIMAL(15, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'USD',
  method VARCHAR(50) NOT NULL,
  status VARCHAR(30) DEFAULT 'pending',
  reference VARCHAR(255),
  paid_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS erp.expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'USD',
  category VARCHAR(100),
  vendor VARCHAR(255),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  status VARCHAR(30) DEFAULT 'pending',
  receipt_url TEXT,
  notes TEXT,
  approved_by UUID REFERENCES system.users(id),
  submitted_by UUID REFERENCES system.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- AI SCHEMA
-- =============================================
CREATE TABLE IF NOT EXISTS ai.ai_agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50) DEFAULT 'assistant',
  model VARCHAR(100) DEFAULT 'gpt-4o',
  system_prompt TEXT,
  temperature DECIMAL(3, 2) DEFAULT 0.7,
  max_tokens INTEGER DEFAULT 2000,
  capabilities TEXT[],
  is_active BOOLEAN DEFAULT true,
  config JSONB DEFAULT '{}',
  total_conversations INTEGER DEFAULT 0,
  total_tokens_used BIGINT DEFAULT 0,
  created_by UUID REFERENCES system.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai.ai_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES ai.ai_agents(id) ON DELETE CASCADE,
  user_id UUID REFERENCES system.users(id) ON DELETE SET NULL,
  client_id UUID REFERENCES crm.clients(id) ON DELETE SET NULL,
  title VARCHAR(255),
  status VARCHAR(30) DEFAULT 'active',
  tokens_used INTEGER DEFAULT 0,
  message_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai.ai_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES ai.ai_conversations(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL,
  content TEXT NOT NULL,
  tokens INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai.ai_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES ai.ai_agents(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50) NOT NULL,
  status VARCHAR(30) DEFAULT 'pending',
  priority VARCHAR(20) DEFAULT 'medium',
  input_data JSONB DEFAULT '{}',
  output_data JSONB DEFAULT '{}',
  error_message TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  duration_ms INTEGER,
  created_by UUID REFERENCES system.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai.ai_memory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES ai.ai_agents(id) ON DELETE CASCADE,
  key VARCHAR(255) NOT NULL,
  value JSONB NOT NULL,
  type VARCHAR(50) DEFAULT 'general',
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(agent_id, key)
);

CREATE TABLE IF NOT EXISTS ai.ai_decisions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES ai.ai_agents(id) ON DELETE CASCADE,
  task_id UUID REFERENCES ai.ai_tasks(id) ON DELETE SET NULL,
  decision VARCHAR(255) NOT NULL,
  reasoning TEXT,
  confidence DECIMAL(5, 4),
  input_context JSONB DEFAULT '{}',
  outcome VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- AUTOMATION SCHEMA
-- =============================================
CREATE TABLE IF NOT EXISTS automation.workflows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  n8n_workflow_id VARCHAR(255),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  trigger_type VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  tags TEXT[],
  last_run_at TIMESTAMPTZ,
  total_runs INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  error_count INTEGER DEFAULT 0,
  config JSONB DEFAULT '{}',
  created_by UUID REFERENCES system.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS automation.workflow_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  workflow_id UUID REFERENCES automation.workflows(id) ON DELETE CASCADE,
  n8n_execution_id VARCHAR(255),
  status VARCHAR(30) DEFAULT 'running',
  started_at TIMESTAMPTZ DEFAULT NOW(),
  finished_at TIMESTAMPTZ,
  duration_ms INTEGER,
  trigger_data JSONB DEFAULT '{}',
  output_data JSONB DEFAULT '{}',
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS automation.automation_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  workflow_id UUID REFERENCES automation.workflows(id) ON DELETE CASCADE,
  run_id UUID REFERENCES automation.workflow_runs(id) ON DELETE CASCADE,
  level VARCHAR(20) DEFAULT 'info',
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- ANALYTICS SCHEMA
-- =============================================
CREATE TABLE IF NOT EXISTS analytics.metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  value DECIMAL(20, 6) NOT NULL,
  unit VARCHAR(50),
  category VARCHAR(100),
  dimension JSONB DEFAULT '{}',
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS analytics.events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES system.users(id) ON DELETE SET NULL,
  event_type VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50),
  resource_id VARCHAR(255),
  properties JSONB DEFAULT '{}',
  session_id VARCHAR(255),
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS analytics.reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50) NOT NULL,
  config JSONB DEFAULT '{}',
  schedule VARCHAR(100),
  last_generated_at TIMESTAMPTZ,
  created_by UUID REFERENCES system.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- INDEXES
-- =============================================
-- System indexes
CREATE INDEX IF NOT EXISTS idx_users_company_id ON system.users(company_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON system.users(email);
CREATE INDEX IF NOT EXISTS idx_audit_logs_company_id ON system.audit_logs(company_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON system.audit_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON system.audit_logs(user_id);

-- CRM indexes
CREATE INDEX IF NOT EXISTS idx_clients_company_id ON crm.clients(company_id);
CREATE INDEX IF NOT EXISTS idx_clients_status ON crm.clients(status);
CREATE INDEX IF NOT EXISTS idx_leads_company_id ON crm.leads(company_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON crm.leads(status);
CREATE INDEX IF NOT EXISTS idx_opportunities_company_id ON crm.opportunities(company_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_stage ON crm.opportunities(stage);
CREATE INDEX IF NOT EXISTS idx_activities_company_id ON crm.activities(company_id);

-- ERP indexes
CREATE INDEX IF NOT EXISTS idx_products_company_id ON erp.products(company_id);
CREATE INDEX IF NOT EXISTS idx_orders_company_id ON erp.orders(company_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON erp.orders(status);
CREATE INDEX IF NOT EXISTS idx_invoices_company_id ON erp.invoices(company_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON erp.invoices(status);
CREATE INDEX IF NOT EXISTS idx_payments_company_id ON erp.payments(company_id);

-- AI indexes
CREATE INDEX IF NOT EXISTS idx_ai_agents_company_id ON ai.ai_agents(company_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_company_id ON ai.ai_conversations(company_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_agent_id ON ai.ai_conversations(agent_id);
CREATE INDEX IF NOT EXISTS idx_ai_tasks_company_id ON ai.ai_tasks(company_id);
CREATE INDEX IF NOT EXISTS idx_ai_tasks_status ON ai.ai_tasks(status);

-- Automation indexes
CREATE INDEX IF NOT EXISTS idx_workflows_company_id ON automation.workflows(company_id);
CREATE INDEX IF NOT EXISTS idx_workflow_runs_workflow_id ON automation.workflow_runs(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_runs_status ON automation.workflow_runs(status);

-- Analytics indexes
CREATE INDEX IF NOT EXISTS idx_metrics_company_id ON analytics.metrics(company_id);
CREATE INDEX IF NOT EXISTS idx_events_company_id ON analytics.events(company_id);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON analytics.events(created_at);

-- =============================================
-- SEED DEFAULT DATA
-- =============================================

-- Insert default company
INSERT INTO companies (id, name, slug, industry, plan) 
VALUES ('00000000-0000-0000-0000-000000000001', 'My Business', 'my-business', 'Technology', 'enterprise')
ON CONFLICT (slug) DO NOTHING;

-- Insert default roles
INSERT INTO system.roles (name, display_name, description) VALUES
  ('super_admin', 'Super Admin', 'Full system access'),
  ('admin', 'Administrator', 'Company administration'),
  ('manager', 'Manager', 'Team and module management'),
  ('agent', 'Agent', 'Operational access'),
  ('viewer', 'Viewer', 'Read-only access')
ON CONFLICT (name) DO NOTHING;

-- Insert default permissions
INSERT INTO system.permissions (name, resource, action) VALUES
  ('crm.clients.read', 'crm.clients', 'read'),
  ('crm.clients.write', 'crm.clients', 'write'),
  ('crm.clients.delete', 'crm.clients', 'delete'),
  ('crm.leads.read', 'crm.leads', 'read'),
  ('crm.leads.write', 'crm.leads', 'write'),
  ('erp.orders.read', 'erp.orders', 'read'),
  ('erp.orders.write', 'erp.orders', 'write'),
  ('erp.invoices.read', 'erp.invoices', 'read'),
  ('erp.invoices.write', 'erp.invoices', 'write'),
  ('ai.agents.read', 'ai.agents', 'read'),
  ('ai.agents.write', 'ai.agents', 'write'),
  ('automation.workflows.read', 'automation.workflows', 'read'),
  ('automation.workflows.write', 'automation.workflows', 'write'),
  ('analytics.read', 'analytics', 'read'),
  ('system.admin', 'system', 'admin'),
  ('users.manage', 'users', 'manage'),
  ('passwords.reset', 'passwords', 'reset'),
  ('support.view', 'support_requests', 'view'),
  ('audit_logs.view', 'audit_logs', 'view')
ON CONFLICT (name) DO NOTHING;

-- Seed default admin user
INSERT INTO system.users (id, company_id, email, password_hash, name, role, is_primary_admin) 
VALUES (
  '00000000-0000-0000-0000-000000000002', 
  '00000000-0000-0000-0000-000000000001', 
  'anchillo00@gmail.com', 
  '$2b$10$AZSkVYuSngiJRS3ZOixLfuyyo9vlcdszNxGHP/iO9fz3khqF41rCCC', 
  'Primary Administrator', 
  'super_admin',
  true
) ON CONFLICT (email) DO NOTHING;
