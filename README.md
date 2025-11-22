# E-Commerce Plugin for cf-cms.js

A professional, production-ready e-commerce plugin for cf-cms.js with complete multi-store support, product management, shopping cart, order processing, payment integration, and digital downloads.

## Features

### 🏪 Multi-Store Support
- Create and manage multiple independent stores
- Store-specific settings and configurations
- Isolated product catalogs per store
- Multi-currency support

### 📦 Product Management
- Physical and digital products
- Product variants (size, color, etc.)
- Inventory tracking
- Product categories and tags
- Featured products
- Product images and galleries

### 🛒 Shopping Cart
- Persistent cart storage
- Cart item management
- Automatic total calculation
- Tax calculation
- Shipping cost integration
- Coupon/discount application

### 📋 Order Management
- Complete order lifecycle
- Order status tracking
- Order history
- Customer information
- Shipping and billing addresses
- Order notes and metadata

### 💳 Payment Processing
- Stripe integration
- PayPal integration
- Multiple payment methods per store
- Payment status tracking
- Refund processing
- Webhook support

### 📥 Digital Downloads
- Secure file storage in R2
- Download link generation
- Download tracking
- Expiration management
- Download limits
- Automatic link generation on order completion

### 📊 Admin Interface
- Store management dashboard
- Product management interface
- Order management system
- Payment method configuration
- Analytics and reporting

## Installation

### From NPM

```bash
npm install @ylstack-dev/cf-cms-ecommerce
```

### From Local

```bash
cf-cms plugin install ../packages/ecommerce-plugin --local
```

## Configuration

### Environment Variables

```env
# Stripe Configuration
ECOMMERCE_STRIPE_KEY=sk_test_...
ECOMMERCE_STRIPE_PUBLIC_KEY=pk_test_...

# PayPal Configuration
ECOMMERCE_PAYPAL_CLIENT_ID=...
ECOMMERCE_PAYPAL_CLIENT_SECRET=...

# Digital Downloads
ECOMMERCE_ENABLE_DOWNLOADS=true
ECOMMERCE_DOWNLOAD_EXPIRATION=30
ECOMMERCE_MAX_DOWNLOADS=5

# Inventory
ECOMMERCE_ENABLE_INVENTORY=true
ECOMMERCE_LOW_STOCK_THRESHOLD=10
```

### Plugin Configuration

The plugin is configured via `manifest.json` and automatically registered with the core plugin system.

```json
{
  "id": "ecommerce",
  "name": "E-Commerce Plugin",
  "version": "2.0.1",
  "capabilities": {
    "routes": true,
    "hooks": true,
    "adminPages": true,
    "services": true
  }
}
```

## API Endpoints

### Stores

```
GET    /api/stores              # List all stores
POST   /api/stores              # Create new store
GET    /api/stores/:id          # Get store details
PUT    /api/stores/:id          # Update store
DELETE /api/stores/:id          # Delete store
```

### Products

```
GET    /api/products            # List products (requires store_id query param)
POST   /api/products            # Create product
GET    /api/products/:id        # Get product details
PUT    /api/products/:id        # Update product
DELETE /api/products/:id        # Delete product
```

### Orders

```
GET    /api/orders              # List orders (requires store_id query param)
POST   /api/orders              # Create order
GET    /api/orders/:id          # Get order details
PUT    /api/orders/:id/status   # Update order status
```

### Payments

```
POST   /api/payments/process    # Process payment
POST   /api/payments/webhook/stripe  # Stripe webhook
POST   /api/payments/webhook/paypal  # PayPal webhook
GET    /api/payments/methods    # Get payment methods (requires store_id)
```

### Digital Downloads

```
GET    /api/downloads/:token    # Download file
GET    /api/downloads/:token/info  # Get download info
```

## Admin Pages

### Store Management
- **Path**: `/admin/ecommerce/stores`
- **Features**: Create, edit, delete stores
- **Permissions**: `ecommerce:stores:view`

### Product Catalog
- **Path**: `/admin/ecommerce/products`
- **Features**: Manage products, variants, inventory
- **Permissions**: `ecommerce:products:view`

### Order Management
- **Path**: `/admin/ecommerce/orders`
- **Features**: View, update, fulfill orders
- **Permissions**: `ecommerce:orders:view`

### Payment Configuration
- **Path**: `/admin/ecommerce/payments`
- **Features**: Configure payment methods
- **Permissions**: `ecommerce:admin`

### Analytics
- **Path**: `/admin/ecommerce/analytics`
- **Features**: Sales analytics and reports
- **Permissions**: `ecommerce:analytics:view`

## Database Schema

The plugin uses the following tables (created automatically):

- `stores` - Store information
- `products` - Product catalog
- `product_variants` - Product variants
- `product_categories` - Product categories
- `product_category_mappings` - Product-category relationships
- `carts` - Shopping carts
- `cart_items` - Cart items
- `orders` - Orders
- `order_items` - Order items
- `digital_downloads` - Digital product files
- `download_links` - Download access links
- `payment_methods` - Payment gateway configuration
- `payments` - Payment transactions
- `refunds` - Refund records
- `coupons` - Discount codes
- `shipping_methods` - Shipping options

## Hooks

The plugin registers the following hooks:

- `app:ready` - Plugin initialization
- `store:before:create` - Before store creation
- `store:after:create` - After store creation
- `order:before:create` - Before order creation
- `order:after:create` - After order creation
- `order:before:update` - Before order update
- `order:after:update` - After order update
- `payment:before:process` - Before payment processing
- `payment:after:process` - After payment processing

## Usage Examples

### Create a Store

```bash
curl -X POST http://localhost:8787/api/stores \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Store",
    "slug": "my-store",
    "currency": "USD",
    "taxRate": 8.5
  }'
```

### Create a Product

```bash
curl -X POST http://localhost:8787/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "storeId": "store_123",
    "name": "Awesome Product",
    "slug": "awesome-product",
    "type": "physical",
    "price": 29.99,
    "sku": "PROD-001"
  }'
```

### Create an Order

```bash
curl -X POST http://localhost:8787/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "storeId": "store_123",
    "email": "customer@example.com",
    "total": 59.98
  }'
```

### Process Payment

```bash
curl -X POST http://localhost:8787/api/payments/process \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "order_123",
    "amount": 59.98,
    "paymentMethod": "stripe"
  }'
```

## Development

### Build

```bash
npm run build
```

### Watch Mode

```bash
npm run dev
```

### Test

```bash
npm test
```

### Type Check

```bash
npm run type-check
```

## Architecture

The plugin is built on top of the cf-cms.js core plugin system:

- **Plugin Manager** - Orchestrates plugin lifecycle
- **Route Registry** - Dynamically registers API routes
- **Admin UI Registry** - Dynamically registers admin pages
- **Hook System** - Event-driven extensions
- **Permission System** - Role-based access control
- **Plugin Sandbox** - Security isolation

## Security Features

- Database isolation - Plugins can only access their own tables
- KV namespacing - Plugin KV keys are prefixed with plugin ID
- R2 isolation - Plugin R2 objects are prefixed with plugin ID
- Permission checking - All operations require appropriate permissions
- File size limits - Prevent abuse of storage (500MB max per file)
- Query validation - Prevent DROP/ALTER operations
- Input validation - All endpoints validate input

## Performance Optimizations

- Lazy loading - Plugins loaded on-demand
- Caching - Plugin manifests cached in KV
- Dependency resolution - Topological sort for optimal load order
- Parallel hooks - Non-modifying hooks execute in parallel
- Route indexing - Fast route lookup
- Permission caching - User permissions cached

## Troubleshooting

### Payment Processing Fails
- Verify Stripe/PayPal credentials in environment variables
- Check webhook configuration
- Review payment logs in admin panel

### Download Links Expire Too Quickly
- Adjust `ECOMMERCE_DOWNLOAD_EXPIRATION` environment variable
- Check R2 bucket permissions

### Cart Not Persisting
- Verify D1 database connection
- Check cart expiration settings

## Support

- **Documentation**: https://docs.cf-cms.js
- **Issues**: https://github.com/ylstack-dev/cf-cms/issues
- **Discord**: https://discord.gg/cf-cms

## License

MIT

## Changelog

### 2.0.1
- Initial release for cf-cms.js 2.0
- Multi-store support
- Digital downloads
- Payment gateway integration
- Admin UI integration
- Professional plugin package structure

