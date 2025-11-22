-- E-commerce Plugin Sample Data
-- Inserts sample products, customers, and orders for testing

-- Sample products
INSERT OR IGNORE INTO ecommerce_products (id, name, description, price, category, sku, stock_quantity, created_at, updated_at)
VALUES 
  (1, 'Wireless Headphones', 'High-quality wireless headphones with noise cancellation', 199.99, 'electronics', 'WH-001', 50, strftime('%s', 'now') * 1000, strftime('%s', 'now') * 1000),
  (2, 'Coffee Mug', 'Ceramic coffee mug with custom design', 15.99, 'home', 'MUG-001', 100, strftime('%s', 'now') * 1000, strftime('%s', 'now') * 1000),
  (3, 'T-Shirt', 'Comfortable cotton t-shirt', 24.99, 'clothing', 'SHIRT-001', 75, strftime('%s', 'now') * 1000, strftime('%s', 'now') * 1000),
  (4, 'Laptop Stand', 'Adjustable aluminum laptop stand', 89.99, 'electronics', 'STAND-001', 25, strftime('%s', 'now') * 1000, strftime('%s', 'now') * 1000),
  (5, 'Notebook', 'Premium leather-bound notebook', 29.99, 'office', 'NOTE-001', 60, strftime('%s', 'now') * 1000, strftime('%s', 'now') * 1000);

-- Sample customers
INSERT OR IGNORE INTO ecommerce_customers (id, name, email, phone, address, created_at, updated_at)
VALUES 
  (1, 'John Doe', 'john.doe@example.com', '+1-555-0123', '{"street":"123 Main St","city":"New York","state":"NY","zip":"10001"}', strftime('%s', 'now') * 1000, strftime('%s', 'now') * 1000),
  (2, 'Jane Smith', 'jane.smith@example.com', '+1-555-0124', '{"street":"456 Oak Ave","city":"Los Angeles","state":"CA","zip":"90210"}', strftime('%s', 'now') * 1000, strftime('%s', 'now') * 1000),
  (3, 'Bob Johnson', 'bob.johnson@example.com', '+1-555-0125', '{"street":"789 Pine Rd","city":"Chicago","state":"IL","zip":"60601"}', strftime('%s', 'now') * 1000, strftime('%s', 'now') * 1000);

-- Sample orders
INSERT OR IGNORE INTO ecommerce_orders (id, order_number, customer_id, status, total, items, shipping_address, billing_address, payment_method, created_at, updated_at)
VALUES 
  (1, 'ORD-' || strftime('%s', 'now') || '-001', 1, 'completed', 215.98, '[{"product_id":1,"quantity":1,"price":199.99},{"product_id":2,"quantity":1,"price":15.99}]', '{"street":"123 Main St","city":"New York","state":"NY","zip":"10001"}', '{"street":"123 Main St","city":"New York","state":"NY","zip":"10001"}', 'stripe', strftime('%s', 'now') * 1000, strftime('%s', 'now') * 1000),
  (2, 'ORD-' || strftime('%s', 'now') || '-002', 2, 'processing', 114.98, '[{"product_id":3,"quantity":2,"price":24.99},{"product_id":4,"quantity":1,"price":89.99}]', '{"street":"456 Oak Ave","city":"Los Angeles","state":"CA","zip":"90210"}', '{"street":"456 Oak Ave","city":"Los Angeles","state":"CA","zip":"90210"}', 'paypal', strftime('%s', 'now') * 1000, strftime('%s', 'now') * 1000),
  (3, 'ORD-' || strftime('%s', 'now') || '-003', 3, 'pending', 29.99, '[{"product_id":5,"quantity":1,"price":29.99}]', '{"street":"789 Pine Rd","city":"Chicago","state":"IL","zip":"60601"}', '{"street":"789 Pine Rd","city":"Chicago","state":"IL","zip":"60601"}', 'stripe', strftime('%s', 'now') * 1000, strftime('%s', 'now') * 1000);

-- Sample categories
INSERT OR IGNORE INTO ecommerce_categories (id, name, slug, description, created_at, updated_at)
VALUES 
  (1, 'Electronics', 'electronics', 'Electronic devices and accessories', strftime('%s', 'now') * 1000, strftime('%s', 'now') * 1000),
  (2, 'Clothing', 'clothing', 'Apparel and fashion items', strftime('%s', 'now') * 1000, strftime('%s', 'now') * 1000),
  (3, 'Home & Garden', 'home', 'Home decor and garden supplies', strftime('%s', 'now') * 1000, strftime('%s', 'now') * 1000),
  (4, 'Office Supplies', 'office', 'Office and business supplies', strftime('%s', 'now') * 1000, strftime('%s', 'now') * 1000);
