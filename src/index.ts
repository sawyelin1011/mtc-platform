/**
 * E-commerce Plugin for CF-CMS
 * Complete e-commerce solution with products, orders, customers, and inventory
 * Includes both backend APIs and frontend admin templates
 */

import type { Context } from 'hono'

// ============================================================================
// MODAL COMPONENTS
// ============================================================================

/**
 * Render a form modal
 */
function renderFormModal(options: {
  id: string
  title: string
  formContent: string
  submitText?: string
  submitAction?: string
}): string {
  const { id, title, formContent, submitText = 'Save', submitAction = '' } = options
  
  return `
    <div id="${id}" class="fixed inset-0 bg-zinc-950/50 backdrop-blur-sm flex items-center justify-center z-50 hidden">
      <div class="rounded-xl bg-white dark:bg-zinc-900 shadow-2xl ring-1 ring-zinc-950/5 dark:ring-white/10 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div class="px-6 py-5 border-b border-zinc-950/5 dark:border-white/5 sticky top-0 bg-white dark:bg-zinc-900 z-10">
          <div class="flex items-center justify-between">
            <h3 class="text-base font-semibold text-zinc-950 dark:text-white">${title}</h3>
            <button onclick="closeModal('${id}')" class="text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>
        
        <form id="${id}-form" onsubmit="${submitAction}; return false;" class="px-6 py-5">
          ${formContent}
          
          <div class="flex gap-3 justify-end pt-5 border-t border-zinc-950/5 dark:border-white/5 mt-5">
            <button
              type="button"
              onclick="closeModal('${id}')"
              class="rounded-lg bg-white dark:bg-zinc-800 px-4 py-2.5 text-sm font-semibold text-zinc-950 dark:text-white shadow-sm ring-1 ring-inset ring-zinc-950/10 dark:ring-white/10 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-colors"
            >
              ${submitText}
            </button>
          </div>
        </form>
      </div>
    </div>
  `
}

/**
 * Modal helper scripts
 */
function getModalScripts(): string {
  return `
    <script>
      function openModal(modalId) {
        document.getElementById(modalId).classList.remove('hidden');
        document.body.style.overflow = 'hidden';
      }
      
      function closeModal(modalId) {
        document.getElementById(modalId).classList.add('hidden');
        document.body.style.overflow = '';
        const form = document.getElementById(modalId + '-form');
        if (form) form.reset();
      }
      
      // Close on escape key
      document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
          const modals = document.querySelectorAll('[id$="-modal"]:not(.hidden)');
          modals.forEach(modal => closeModal(modal.id));
        }
      });
      
      // Close on backdrop click
      document.querySelectorAll('[id$="-modal"]').forEach(modal => {
        modal.addEventListener('click', function(e) {
          if (e.target === this) closeModal(this.id);
        });
      });
    </script>
  `
}

// ============================================================================
// MINI SIDEBAR COMPONENT
// ============================================================================

/**
 * Render mini sidebar for plugin navigation
 */
function renderPluginMiniSidebar(currentPath: string): string {
  const navItems = [
    { path: '/admin/ecommerce', label: 'Dashboard', icon: '📊' },
    { path: '/admin/ecommerce/products', label: 'Products', icon: '📦' },
    { path: '/admin/ecommerce/orders', label: 'Orders', icon: '📋' },
    { path: '/admin/ecommerce/customers', label: 'Customers', icon: '👥' }
  ]
  
  return `
    <div class="mb-6 border-b border-zinc-200 dark:border-zinc-800">
      <nav class="flex gap-1 overflow-x-auto pb-px -mb-px" role="tablist">
        ${navItems.map(item => {
          const isActive = currentPath === item.path
          return `
            <a
              href="${item.path}"
              class="flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                  : 'border-transparent text-zinc-600 hover:text-zinc-900 hover:border-zinc-300 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:border-zinc-700'
              }"
              ${isActive ? 'aria-current="page"' : ''}
            >
              <span>${item.icon}</span>
              <span>${item.label}</span>
            </a>
          `
        }).join('')}
      </nav>
    </div>
  `
}

// Plugin types (matching core types)
interface Plugin {
  name: string
  version: string
  description?: string
  author?: string
  routes?: any[]
  adminPages?: AdminPage[]
  settings?: any
  install?: (context: PluginContext) => Promise<void>
  activate?: (context: PluginContext) => Promise<void>
  deactivate?: (context: PluginContext) => Promise<void>
}

interface PluginContext {
  db: any
  config: any
}

interface AdminPage {
  path: string
  title: string
  icon?: string
  handler?: (c: Context) => Promise<string> | string
}

// ============================================================================
// FRONTEND TEMPLATES
// ============================================================================

/**
 * E-commerce Dashboard Template
 */
function renderEcommerceDashboard(data: any): string {
  return `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-semibold text-zinc-950 dark:text-white">E-commerce Dashboard</h1>
        <div class="flex gap-2">
          <a href="/admin/ecommerce/products/new" class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            Add Product
          </a>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div class="rounded-lg bg-white p-6 shadow-sm ring-1 ring-zinc-950/5 dark:bg-zinc-900 dark:ring-white/10">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-zinc-500 dark:text-zinc-400">Total Products</p>
              <p class="mt-2 text-3xl font-semibold text-zinc-950 dark:text-white">${data.stats?.products || 0}</p>
            </div>
            <div class="rounded-full bg-blue-100 p-3 dark:bg-blue-500/10">
              <svg class="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
              </svg>
            </div>
          </div>
        </div>

        <div class="rounded-lg bg-white p-6 shadow-sm ring-1 ring-zinc-950/5 dark:bg-zinc-900 dark:ring-white/10">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-zinc-500 dark:text-zinc-400">Total Orders</p>
              <p class="mt-2 text-3xl font-semibold text-zinc-950 dark:text-white">${data.stats?.orders || 0}</p>
            </div>
            <div class="rounded-full bg-green-100 p-3 dark:bg-green-500/10">
              <svg class="h-6 w-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
            </div>
          </div>
        </div>

        <div class="rounded-lg bg-white p-6 shadow-sm ring-1 ring-zinc-950/5 dark:bg-zinc-900 dark:ring-white/10">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-zinc-500 dark:text-zinc-400">Total Customers</p>
              <p class="mt-2 text-3xl font-semibold text-zinc-950 dark:text-white">${data.stats?.customers || 0}</p>
            </div>
            <div class="rounded-full bg-purple-100 p-3 dark:bg-purple-500/10">
              <svg class="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
              </svg>
            </div>
          </div>
        </div>

        <div class="rounded-lg bg-white p-6 shadow-sm ring-1 ring-zinc-950/5 dark:bg-zinc-900 dark:ring-white/10">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-zinc-500 dark:text-zinc-400">Total Revenue</p>
              <p class="mt-2 text-3xl font-semibold text-zinc-950 dark:text-white">$${(data.stats?.revenue || 0).toFixed(2)}</p>
            </div>
            <div class="rounded-full bg-amber-100 p-3 dark:bg-amber-500/10">
              <svg class="h-6 w-6 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Orders -->
      <div class="rounded-lg bg-white p-6 shadow-sm ring-1 ring-zinc-950/5 dark:bg-zinc-900 dark:ring-white/10">
        <h2 class="text-lg font-semibold text-zinc-950 dark:text-white mb-4">Recent Orders</h2>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
            <thead>
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Order #</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Customer</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Total</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Status</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-zinc-200 dark:divide-zinc-800">
              ${(data.recentOrders || []).map((order: any) => `
                <tr class="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                  <td class="px-4 py-3 text-sm font-medium text-zinc-950 dark:text-white">${order.order_number}</td>
                  <td class="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400">${order.customer_name || 'N/A'}</td>
                  <td class="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400">$${order.total.toFixed(2)}</td>
                  <td class="px-4 py-3 text-sm">
                    <span class="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                      order.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400' :
                      order.status === 'processing' ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400' :
                      order.status === 'pending' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400' :
                      'bg-zinc-100 text-zinc-700 dark:bg-zinc-500/10 dark:text-zinc-400'
                    }">
                      ${order.status}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400">${new Date(order.created_at).toLocaleDateString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
}

// ============================================================================
// BACKEND API ROUTES
// ============================================================================

const routes = [
  // Products API
  {
    path: '/api/ecommerce/products',
    method: 'GET' as const,
    handler: async (c: Context) => {
      const { category, status, limit = '20', offset = '0', search } = c.req.query()
      
      let query = 'SELECT * FROM ecommerce_products WHERE 1=1'
      const params: any[] = []
      
      if (category) {
        query += ' AND category = ?'
        params.push(category)
      }
      
      if (status) {
        query += ' AND status = ?'
        params.push(status)
      }
      
      if (search) {
        query += ' AND (name LIKE ? OR description LIKE ?)'
        params.push(`%${search}%`, `%${search}%`)
      }
      
      query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?'
      params.push(limit, offset)
      
      const result = await (c.env as any).DB.prepare(query).bind(...params).all()
      
      return c.json({
        success: true,
        data: result.results,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: result.results?.length || 0
        }
      })
    }
  },
  {
    path: '/api/ecommerce/products',
    method: 'POST' as const,
    handler: async (c: Context) => {
      const { name, description, price, category, sku, stock_quantity, images } = await c.req.json()
      
      if (!name || !price) {
        return c.json({ success: false, error: 'Name and price are required' }, 400)
      }
      
      const now = Date.now()
      const result = await (c.env as any).DB.prepare(`
        INSERT INTO ecommerce_products (name, description, price, category, sku, stock_quantity, images, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(name, description, price, category || 'general', sku, stock_quantity || 0, JSON.stringify(images || []), now, now).run()
      
      return c.json({
        success: true,
        data: {
          id: result.meta.last_row_id,
          name,
          description,
          price,
          category,
          sku,
          stock_quantity,
          images,
          created_at: now,
          updated_at: now
        }
      }, 201)
    }
  },
  
  // Analytics API
  {
    path: '/api/ecommerce/analytics',
    method: 'GET' as const,
    handler: async (c: Context) => {
      const productsCount = await (c.env as any).DB.prepare(
        'SELECT COUNT(*) as count FROM ecommerce_products'
      ).first()
      
      const ordersCount = await (c.env as any).DB.prepare(
        'SELECT COUNT(*) as count FROM ecommerce_orders'
      ).first()
      
      const customersCount = await (c.env as any).DB.prepare(
        'SELECT COUNT(*) as count FROM ecommerce_customers'
      ).first()
      
      const totalRevenue = await (c.env as any).DB.prepare(
        'SELECT SUM(total) as revenue FROM ecommerce_orders WHERE status = "completed"'
      ).first()
      
      const recentOrders = await (c.env as any).DB.prepare(`
        SELECT o.*, c.name as customer_name
        FROM ecommerce_orders o
        LEFT JOIN ecommerce_customers c ON o.customer_id = c.id
        ORDER BY o.created_at DESC
        LIMIT 5
      `).all()
      
      return c.json({
        success: true,
        data: {
          products: productsCount?.count || 0,
          orders: ordersCount?.count || 0,
          customers: customersCount?.count || 0,
          revenue: totalRevenue?.revenue || 0,
          recentOrders: recentOrders.results || []
        }
      })
    }
  }
]

// ============================================================================
// ADMIN PAGES WITH TEMPLATES
// ============================================================================

const adminPages: AdminPage[] = [
  {
    path: '/admin/ecommerce',
    title: 'E-commerce',
    icon: `<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
    </svg>`,
    handler: async (c: Context) => {
      // Fetch analytics data directly from database
      const productsCount = await (c.env as any).DB.prepare(
        'SELECT COUNT(*) as count FROM ecommerce_products'
      ).first()
      
      const ordersCount = await (c.env as any).DB.prepare(
        'SELECT COUNT(*) as count FROM ecommerce_orders'
      ).first()
      
      const customersCount = await (c.env as any).DB.prepare(
        'SELECT COUNT(*) as count FROM ecommerce_customers'
      ).first()
      
      const totalRevenue = await (c.env as any).DB.prepare(
        'SELECT SUM(total) as revenue FROM ecommerce_orders WHERE status = "completed"'
      ).first()
      
      const recentOrders = await (c.env as any).DB.prepare(`
        SELECT o.*, c.name as customer_name
        FROM ecommerce_orders o
        LEFT JOIN ecommerce_customers c ON o.customer_id = c.id
        ORDER BY o.created_at DESC
        LIMIT 5
      `).all()
      
      const dashboardContent = renderEcommerceDashboard({
        stats: {
          products: productsCount?.count || 0,
          orders: ordersCount?.count || 0,
          customers: customersCount?.count || 0,
          revenue: totalRevenue?.revenue || 0
        },
        recentOrders: recentOrders.results || []
      })
      
      return renderPluginMiniSidebar('/admin/ecommerce') + dashboardContent
    }
  },
  {
    path: '/admin/ecommerce/products',
    title: 'Products',
    icon: `<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
    </svg>`,
    handler: async (c: Context) => {
      // Fetch products from database
      const products = await (c.env as any).DB.prepare(
        'SELECT * FROM ecommerce_products ORDER BY created_at DESC LIMIT 50'
      ).all()
      
      const productFormContent = `
        <div class="grid grid-cols-1 gap-4">
          <div>
            <label class="block text-sm font-medium text-zinc-950 dark:text-white mb-2">Product Name</label>
            <input type="text" name="name" required class="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-950 dark:text-white">
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-zinc-950 dark:text-white mb-2">SKU</label>
              <input type="text" name="sku" class="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-950 dark:text-white">
            </div>
            <div>
              <label class="block text-sm font-medium text-zinc-950 dark:text-white mb-2">Category</label>
              <input type="text" name="category" class="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-950 dark:text-white">
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-zinc-950 dark:text-white mb-2">Description</label>
            <textarea name="description" rows="3" class="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-950 dark:text-white"></textarea>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-zinc-950 dark:text-white mb-2">Price</label>
              <input type="number" name="price" step="0.01" required class="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-950 dark:text-white">
            </div>
            <div>
              <label class="block text-sm font-medium text-zinc-950 dark:text-white mb-2">Stock Quantity</label>
              <input type="number" name="stock_quantity" required class="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-950 dark:text-white">
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-zinc-950 dark:text-white mb-2">Status</label>
            <select name="status" class="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-950 dark:text-white">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      `
      
      return renderPluginMiniSidebar('/admin/ecommerce/products') + `
        <div class="space-y-4 sm:space-y-6">
          <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 class="text-2xl font-semibold text-zinc-950 dark:text-white">Products</h1>
              <p class="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Manage your product catalog</p>
            </div>
            <button onclick="openModal('product-modal')" class="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 sm:w-auto w-full">
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
              </svg>
              Add Product
            </button>
          </div>

          <div class="rounded-lg bg-white shadow-sm ring-1 ring-zinc-950/5 dark:bg-zinc-900 dark:ring-white/10 overflow-hidden">
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
                <thead class="bg-zinc-50 dark:bg-zinc-800/50">
                  <tr>
                    <th class="px-4 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Product</th>
                    <th class="hidden sm:table-cell px-4 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Category</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Price</th>
                    <th class="hidden md:table-cell px-4 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Stock</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Status</th>
                    <th class="px-4 py-3 text-right text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-zinc-200 dark:divide-zinc-800">
                  ${(products.results || []).map((product: any) => `
                    <tr class="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                      <td class="px-4 py-3">
                        <div class="flex items-center gap-3">
                          <div class="h-10 w-10 flex-shrink-0 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                            <svg class="h-5 w-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                            </svg>
                          </div>
                          <div class="min-w-0 flex-1">
                            <p class="text-sm font-medium text-zinc-950 dark:text-white truncate">${product.name}</p>
                            <p class="text-xs text-zinc-500 dark:text-zinc-400 truncate">${product.sku || 'No SKU'}</p>
                          </div>
                        </div>
                      </td>
                      <td class="hidden sm:table-cell px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400">${product.category}</td>
                      <td class="px-4 py-3 text-sm font-medium text-zinc-950 dark:text-white">$${product.price.toFixed(2)}</td>
                      <td class="hidden md:table-cell px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400">${product.stock_quantity}</td>
                      <td class="px-4 py-3">
                        <span class="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                          product.status === 'active' 
                            ? 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400' 
                            : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-500/10 dark:text-zinc-400'
                        }">
                          ${product.status}
                        </span>
                      </td>
                      <td class="px-4 py-3 text-right text-sm">
                        <button onclick="editProduct(${product.id})" class="text-blue-600 hover:text-blue-700 dark:text-blue-400">Edit</button>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        ${renderFormModal({
          id: 'product-modal',
          title: 'Add Product',
          formContent: productFormContent,
          submitText: 'Save Product',
          submitAction: 'saveProduct(event)'
        })}
        
        ${getModalScripts()}
        
        <script>
          async function saveProduct(event) {
            event.preventDefault();
            const form = document.getElementById('product-modal-form');
            const formData = new FormData(form);
            const data = Object.fromEntries(formData);
            
            try {
              const response = await fetch('/api/ecommerce/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
              });
              
              if (response.ok) {
                closeModal('product-modal');
                window.location.reload();
              } else {
                alert('Failed to save product');
              }
            } catch (error) {
              console.error('Error:', error);
              alert('Failed to save product');
            }
          }
          
          function editProduct(id) {
            // TODO: Load product data and open modal for editing
            console.log('Edit product:', id);
          }
        </script>
      `
    }
  },
  {
    path: '/admin/ecommerce/orders',
    title: 'Orders',
    icon: `<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
    </svg>`,
    handler: async (c: Context) => {
      // Fetch orders with customer info
      const orders = await (c.env as any).DB.prepare(`
        SELECT o.*, c.name as customer_name, c.email as customer_email
        FROM ecommerce_orders o
        LEFT JOIN ecommerce_customers c ON o.customer_id = c.id
        ORDER BY o.created_at DESC
        LIMIT 50
      `).all()
      
      return renderPluginMiniSidebar('/admin/ecommerce/orders') + `
        <div class="space-y-4 sm:space-y-6">
          <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 class="text-2xl font-semibold text-zinc-950 dark:text-white">Orders</h1>
              <p class="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Manage customer orders</p>
            </div>
            <div class="flex gap-2">
              <select class="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm">
                <option>All Status</option>
                <option>Pending</option>
                <option>Processing</option>
                <option>Completed</option>
              </select>
            </div>
          </div>

          <div class="grid gap-4 sm:hidden">
            ${(orders.results || []).map((order: any) => `
              <div class="rounded-lg bg-white p-4 shadow-sm ring-1 ring-zinc-950/5 dark:bg-zinc-900 dark:ring-white/10">
                <div class="flex items-start justify-between mb-3">
                  <div>
                    <p class="text-sm font-semibold text-zinc-950 dark:text-white">${order.order_number}</p>
                    <p class="text-xs text-zinc-500 dark:text-zinc-400 mt-1">${order.customer_name || 'Unknown'}</p>
                  </div>
                  <span class="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                    order.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400' :
                    order.status === 'processing' ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400' :
                    order.status === 'pending' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400' :
                    'bg-zinc-100 text-zinc-700 dark:bg-zinc-500/10 dark:text-zinc-400'
                  }">
                    ${order.status}
                  </span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-lg font-semibold text-zinc-950 dark:text-white">$${order.total.toFixed(2)}</span>
                  <span class="text-xs text-zinc-500 dark:text-zinc-400">${new Date(order.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            `).join('')}
          </div>

          <div class="hidden sm:block rounded-lg bg-white shadow-sm ring-1 ring-zinc-950/5 dark:bg-zinc-900 dark:ring-white/10 overflow-hidden">
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
                <thead class="bg-zinc-50 dark:bg-zinc-800/50">
                  <tr>
                    <th class="px-4 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Order</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Customer</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Total</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Status</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Date</th>
                    <th class="px-4 py-3 text-right text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-zinc-200 dark:divide-zinc-800">
                  ${(orders.results || []).map((order: any) => `
                    <tr class="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                      <td class="px-4 py-3 text-sm font-medium text-zinc-950 dark:text-white">${order.order_number}</td>
                      <td class="px-4 py-3">
                        <div>
                          <p class="text-sm font-medium text-zinc-950 dark:text-white">${order.customer_name || 'Unknown'}</p>
                          <p class="text-xs text-zinc-500 dark:text-zinc-400">${order.customer_email || ''}</p>
                        </div>
                      </td>
                      <td class="px-4 py-3 text-sm font-medium text-zinc-950 dark:text-white">$${order.total.toFixed(2)}</td>
                      <td class="px-4 py-3">
                        <span class="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                          order.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400' :
                          order.status === 'processing' ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400' :
                          order.status === 'pending' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400' :
                          'bg-zinc-100 text-zinc-700 dark:bg-zinc-500/10 dark:text-zinc-400'
                        }">
                          ${order.status}
                        </span>
                      </td>
                      <td class="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400">${new Date(order.created_at).toLocaleDateString()}</td>
                      <td class="px-4 py-3 text-right text-sm">
                        <button class="text-blue-600 hover:text-blue-700 dark:text-blue-400">View</button>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      `
    }
  },
  {
    path: '/admin/ecommerce/customers',
    title: 'Customers',
    icon: `<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
    </svg>`,
    handler: async (c: Context) => {
      // Fetch customers
      const customers = await (c.env as any).DB.prepare(`
        SELECT * FROM ecommerce_customers
        ORDER BY created_at DESC
        LIMIT 50
      `).all()
      
      const customerFormContent = `
        <div class="grid grid-cols-1 gap-4">
          <div>
            <label class="block text-sm font-medium text-zinc-950 dark:text-white mb-2">Full Name</label>
            <input type="text" name="name" required class="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-950 dark:text-white">
          </div>
          <div>
            <label class="block text-sm font-medium text-zinc-950 dark:text-white mb-2">Email</label>
            <input type="email" name="email" required class="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-950 dark:text-white">
          </div>
          <div>
            <label class="block text-sm font-medium text-zinc-950 dark:text-white mb-2">Phone</label>
            <input type="tel" name="phone" class="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-950 dark:text-white">
          </div>
          <div>
            <label class="block text-sm font-medium text-zinc-950 dark:text-white mb-2">Address</label>
            <textarea name="address" rows="2" class="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-950 dark:text-white"></textarea>
          </div>
        </div>
      `
      
      return renderPluginMiniSidebar('/admin/ecommerce/customers') + `
        <div class="space-y-4 sm:space-y-6">
          <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 class="text-2xl font-semibold text-zinc-950 dark:text-white">Customers</h1>
              <p class="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Manage customer information</p>
            </div>
            <button onclick="openModal('customer-modal')" class="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 sm:w-auto w-full">
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
              </svg>
              Add Customer
            </button>
          </div>

          <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            ${(customers.results || []).map((customer: any) => `
              <div class="rounded-lg bg-white p-4 shadow-sm ring-1 ring-zinc-950/5 dark:bg-zinc-900 dark:ring-white/10">
                <div class="flex items-start gap-3">
                  <div class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-500/10">
                    <span class="text-lg font-semibold text-blue-600 dark:text-blue-400">${customer.name.charAt(0).toUpperCase()}</span>
                  </div>
                  <div class="min-w-0 flex-1">
                    <p class="text-sm font-semibold text-zinc-950 dark:text-white truncate">${customer.name}</p>
                    <p class="text-xs text-zinc-500 dark:text-zinc-400 truncate">${customer.email}</p>
                    ${customer.phone ? `<p class="text-xs text-zinc-500 dark:text-zinc-400 mt-1">${customer.phone}</p>` : ''}
                  </div>
                </div>
                <div class="mt-4 flex items-center justify-between border-t border-zinc-200 dark:border-zinc-800 pt-3">
                  <div>
                    <p class="text-xs text-zinc-500 dark:text-zinc-400">Orders</p>
                    <p class="text-sm font-semibold text-zinc-950 dark:text-white">${customer.total_orders || 0}</p>
                  </div>
                  <div>
                    <p class="text-xs text-zinc-500 dark:text-zinc-400">Total Spent</p>
                    <p class="text-sm font-semibold text-zinc-950 dark:text-white">$${(customer.total_spent || 0).toFixed(2)}</p>
                  </div>
                  <button onclick="viewCustomer(${customer.id})" class="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400">View</button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
        
        ${renderFormModal({
          id: 'customer-modal',
          title: 'Add Customer',
          formContent: customerFormContent,
          submitText: 'Save Customer',
          submitAction: 'saveCustomer(event)'
        })}
        
        ${getModalScripts()}
        
        <script>
          async function saveCustomer(event) {
            event.preventDefault();
            const form = document.getElementById('customer-modal-form');
            const formData = new FormData(form);
            const data = Object.fromEntries(formData);
            
            try {
              const response = await fetch('/api/ecommerce/customers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
              });
              
              if (response.ok) {
                closeModal('customer-modal');
                window.location.reload();
              } else {
                alert('Failed to save customer');
              }
            } catch (error) {
              console.error('Error:', error);
              alert('Failed to save customer');
            }
          }
          
          function viewCustomer(id) {
            // TODO: Show customer details
            console.log('View customer:', id);
          }
        </script>
      `
    }
  }
]

// ============================================================================
// PLUGIN DEFINITION
// ============================================================================

export const ecommercePlugin: Plugin = {
  name: 'ecommerce-plugin',
  version: '2.0.0',
  description: 'Complete e-commerce solution with products, orders, customers, and analytics',
  author: 'CF-CMS Team',
  
  routes,
  adminPages,
  
  // Plugin settings
  settings: {
    storeName: {
      type: 'string',
      default: 'My Store',
      label: 'Store Name',
      description: 'Name of your online store'
    },
    currency: {
      type: 'string',
      default: 'USD',
      label: 'Currency',
      description: 'Default currency for prices'
    },
    taxRate: {
      type: 'number',
      default: 0.08,
      label: 'Tax Rate',
      description: 'Default tax rate (as decimal, e.g., 0.08 for 8%)'
    }
  },
  
  // Lifecycle hooks
  async install(context: PluginContext) {
    console.log('[E-commerce Plugin] Installing...')
    console.log('[E-commerce Plugin] Database migrations will create:')
    console.log('- ecommerce_products table')
    console.log('- ecommerce_orders table')
    console.log('- ecommerce_customers table')
    console.log('- ecommerce_categories table')
  },
  
  async activate(context: PluginContext) {
    console.log('[E-commerce Plugin] Activating...')
    console.log('[E-commerce Plugin] Admin pages registered:')
    console.log('- E-commerce Dashboard')
    console.log('- Products Management')
    console.log('- Orders Management')
    console.log('- Customers Management')
  },
  
  async deactivate(context: PluginContext) {
    console.log('[E-commerce Plugin] Deactivating...')
  }
}

export default ecommercePlugin
