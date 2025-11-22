-- E-commerce Plugin Migration
-- Creates all necessary tables for e-commerce functionality

-- Products table
CREATE TABLE IF NOT EXISTS ecommerce_products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  price REAL NOT NULL,
  category TEXT DEFAULT 'general',
  sku TEXT UNIQUE,
  stock_quantity INTEGER DEFAULT 0,
  images TEXT,
  status TEXT DEFAULT 'active',
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_ecommerce_products_category ON ecommerce_products(category);
CREATE INDEX IF NOT EXISTS idx_ecommerce_products_status ON ecommerce_products(status);
CREATE INDEX IF NOT EXISTS idx_ecommerce_products_sku ON ecommerce_products(sku);

-- Customers table
CREATE TABLE IF NOT EXISTS ecommerce_customers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  address TEXT,
  status TEXT DEFAULT 'active',
  total_orders INTEGER DEFAULT 0,
  total_spent REAL DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_ecommerce_customers_email ON ecommerce_customers(email);
CREATE INDEX IF NOT EXISTS idx_ecommerce_customers_status ON ecommerce_customers(status);

-- Orders table
CREATE TABLE IF NOT EXISTS ecommerce_orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_number TEXT UNIQUE NOT NULL,
  customer_id INTEGER NOT NULL,
  status TEXT DEFAULT 'pending',
  total REAL NOT NULL,
  items TEXT NOT NULL,
  shipping_address TEXT,
  billing_address TEXT,
  payment_method TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (customer_id) REFERENCES ecommerce_customers(id)
);

CREATE INDEX IF NOT EXISTS idx_ecommerce_orders_customer_id ON ecommerce_orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_ecommerce_orders_status ON ecommerce_orders(status);
CREATE INDEX IF NOT EXISTS idx_ecommerce_orders_order_number ON ecommerce_orders(order_number);

-- Categories table
CREATE TABLE IF NOT EXISTS ecommerce_categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  parent_id INTEGER,
  status TEXT DEFAULT 'active',
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (parent_id) REFERENCES ecommerce_categories(id)
);

CREATE INDEX IF NOT EXISTS idx_ecommerce_categories_slug ON ecommerce_categories(slug);
CREATE INDEX IF NOT EXISTS idx_ecommerce_categories_parent_id ON ecommerce_categories(parent_id);
