/**
 * Order Service - Order management and fulfillment
 * 
 * Manages orders, order items, and order status workflow
 */

import type { D1Database } from '@cloudflare/workers-types'

export type OrderStatus = 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
export type PaymentStatus = 'unpaid' | 'paid' | 'refunded' | 'failed'
export type ShippingStatus = 'unshipped' | 'shipped' | 'delivered' | 'returned'

export interface Order {
  id: string
  storeId: string
  orderNumber: string
  userId?: string
  email: string
  status: OrderStatus
  paymentStatus: PaymentStatus
  shippingStatus: ShippingStatus
  subtotal: number
  tax: number
  shipping: number
  discount: number
  total: number
  currency: string
  paymentMethod?: string
  paymentId?: string
  shippingAddress?: Record<string, any>
  billingAddress?: Record<string, any>
  notes?: string
  metadata?: Record<string, any>
  createdAt: number
  updatedAt: number
}

export interface OrderItem {
  id: string
  orderId: string
  productId: string
  variantId?: string
  productName: string
  quantity: number
  price: number
  total: number
  createdAt: number
}

export interface CreateOrderInput {
  storeId: string
  email: string
  userId?: string
  subtotal: number
  tax: number
  shipping: number
  discount: number
  total: number
  currency?: string
  shippingAddress?: Record<string, any>
  billingAddress?: Record<string, any>
  notes?: string
  metadata?: Record<string, any>
}

export interface UpdateOrderInput {
  status?: OrderStatus
  paymentStatus?: PaymentStatus
  shippingStatus?: ShippingStatus
  notes?: string
  metadata?: Record<string, any>
}

export class OrderService {
  constructor(private db: D1Database) {}

  /**
   * Create an order
   */
  async createOrder(input: CreateOrderInput): Promise<Order> {
    const id = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const orderNumber = `ORD-${Date.now()}`
    const now = Math.floor(Date.now() / 1000)

    const order: Order = {
      id,
      storeId: input.storeId,
      orderNumber,
      userId: input.userId,
      email: input.email,
      status: 'pending',
      paymentStatus: 'unpaid',
      shippingStatus: 'unshipped',
      subtotal: input.subtotal,
      tax: input.tax,
      shipping: input.shipping,
      discount: input.discount,
      total: input.total,
      currency: input.currency || 'USD',
      shippingAddress: input.shippingAddress,
      billingAddress: input.billingAddress,
      notes: input.notes,
      metadata: input.metadata,
      createdAt: now,
      updatedAt: now,
    }

    await this.db
      .prepare(`
        INSERT INTO orders 
        (id, store_id, order_number, user_id, email, status, payment_status, shipping_status, 
         subtotal, tax, shipping, discount, total, currency, shipping_address, billing_address, notes, metadata, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .bind(
        order.id,
        order.storeId,
        order.orderNumber,
        order.userId || null,
        order.email,
        order.status,
        order.paymentStatus,
        order.shippingStatus,
        order.subtotal,
        order.tax,
        order.shipping,
        order.discount,
        order.total,
        order.currency,
        order.shippingAddress ? JSON.stringify(order.shippingAddress) : null,
        order.billingAddress ? JSON.stringify(order.billingAddress) : null,
        order.notes || null,
        order.metadata ? JSON.stringify(order.metadata) : null,
        order.createdAt,
        order.updatedAt
      )
      .run()

    return order
  }

  /**
   * Get order by ID
   */
  async getOrder(id: string): Promise<Order | null> {
    const result = await this.db
      .prepare('SELECT * FROM orders WHERE id = ?')
      .bind(id)
      .first()

    if (!result) return null
    return this.mapRowToOrder(result)
  }

  /**
   * Get order by order number
   */
  async getOrderByNumber(storeId: string, orderNumber: string): Promise<Order | null> {
    const result = await this.db
      .prepare('SELECT * FROM orders WHERE store_id = ? AND order_number = ?')
      .bind(storeId, orderNumber)
      .first()

    if (!result) return null
    return this.mapRowToOrder(result)
  }

  /**
   * Get store orders
   */
  async getStoreOrders(storeId: string, status?: OrderStatus): Promise<Order[]> {
    let query = 'SELECT * FROM orders WHERE store_id = ?'
    const params: any[] = [storeId]

    if (status) {
      query += ' AND status = ?'
      params.push(status)
    }

    query += ' ORDER BY created_at DESC'

    const result = await this.db.prepare(query).bind(...params).all()
    return (result.results || []).map(row => this.mapRowToOrder(row))
  }

  /**
   * Get user orders
   */
  async getUserOrders(userId: string): Promise<Order[]> {
    const result = await this.db
      .prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC')
      .bind(userId)
      .all()

    return (result.results || []).map(row => this.mapRowToOrder(row))
  }

  /**
   * Update order
   */
  async updateOrder(id: string, input: UpdateOrderInput): Promise<Order> {
    const order = await this.getOrder(id)
    if (!order) throw new Error(`Order not found: ${id}`)

    const now = Math.floor(Date.now() / 1000)
    const updated: Order = {
      ...order,
      ...input,
      id: order.id,
      storeId: order.storeId,
      orderNumber: order.orderNumber,
      email: order.email,
      createdAt: order.createdAt,
      updatedAt: now,
    }

    await this.db
      .prepare(`
        UPDATE orders 
        SET status = ?, payment_status = ?, shipping_status = ?, notes = ?, metadata = ?, updated_at = ?
        WHERE id = ?
      `)
      .bind(
        updated.status,
        updated.paymentStatus,
        updated.shippingStatus,
        updated.notes || null,
        updated.metadata ? JSON.stringify(updated.metadata) : null,
        updated.updatedAt,
        id
      )
      .run()

    return updated
  }

  /**
   * Update order status
   */
  async updateOrderStatus(id: string, status: OrderStatus): Promise<void> {
    await this.db
      .prepare('UPDATE orders SET status = ?, updated_at = ? WHERE id = ?')
      .bind(status, Math.floor(Date.now() / 1000), id)
      .run()
  }

  /**
   * Update payment status
   */
  async updatePaymentStatus(id: string, status: PaymentStatus): Promise<void> {
    await this.db
      .prepare('UPDATE orders SET payment_status = ?, updated_at = ? WHERE id = ?')
      .bind(status, Math.floor(Date.now() / 1000), id)
      .run()
  }

  /**
   * Update shipping status
   */
  async updateShippingStatus(id: string, status: ShippingStatus): Promise<void> {
    await this.db
      .prepare('UPDATE orders SET shipping_status = ?, updated_at = ? WHERE id = ?')
      .bind(status, Math.floor(Date.now() / 1000), id)
      .run()
  }

  /**
   * Add item to order
   */
  async addItem(orderId: string, input: Omit<OrderItem, 'id' | 'orderId' | 'createdAt'>): Promise<OrderItem> {
    const id = `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const now = Math.floor(Date.now() / 1000)

    const item: OrderItem = {
      id,
      orderId,
      productId: input.productId,
      variantId: input.variantId,
      productName: input.productName,
      quantity: input.quantity,
      price: input.price,
      total: input.total,
      createdAt: now,
    }

    await this.db
      .prepare(`
        INSERT INTO order_items 
        (id, order_id, product_id, variant_id, product_name, quantity, price, total, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .bind(
        item.id,
        item.orderId,
        item.productId,
        item.variantId || null,
        item.productName,
        item.quantity,
        item.price,
        item.total,
        item.createdAt
      )
      .run()

    return item
  }

  /**
   * Get order items
   */
  async getItems(orderId: string): Promise<OrderItem[]> {
    const result = await this.db
      .prepare('SELECT * FROM order_items WHERE order_id = ? ORDER BY created_at ASC')
      .bind(orderId)
      .all()

    return (result.results || []).map(row => this.mapRowToOrderItem(row))
  }

  /**
   * Cancel order
   */
  async cancelOrder(id: string): Promise<void> {
    await this.updateOrderStatus(id, 'cancelled')
  }

  /**
   * Mark order as paid
   */
  async markAsPaid(id: string, paymentId?: string): Promise<void> {
    const updates: any = {
      paymentStatus: 'paid',
      status: 'processing',
    }

    if (paymentId) {
      await this.db
        .prepare('UPDATE orders SET payment_status = ?, status = ?, payment_id = ?, updated_at = ? WHERE id = ?')
        .bind('paid', 'processing', paymentId, Math.floor(Date.now() / 1000), id)
        .run()
    } else {
      await this.db
        .prepare('UPDATE orders SET payment_status = ?, status = ?, updated_at = ? WHERE id = ?')
        .bind('paid', 'processing', Math.floor(Date.now() / 1000), id)
        .run()
    }
  }

  /**
   * Map database row to Order
   */
  private mapRowToOrder(row: any): Order {
    return {
      id: row.id,
      storeId: row.store_id,
      orderNumber: row.order_number,
      userId: row.user_id,
      email: row.email,
      status: row.status,
      paymentStatus: row.payment_status,
      shippingStatus: row.shipping_status,
      subtotal: row.subtotal,
      tax: row.tax,
      shipping: row.shipping,
      discount: row.discount,
      total: row.total,
      currency: row.currency,
      paymentMethod: row.payment_method,
      paymentId: row.payment_id,
      shippingAddress: row.shipping_address ? JSON.parse(row.shipping_address) : undefined,
      billingAddress: row.billing_address ? JSON.parse(row.billing_address) : undefined,
      notes: row.notes,
      metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }
  }

  /**
   * Map database row to OrderItem
   */
  private mapRowToOrderItem(row: any): OrderItem {
    return {
      id: row.id,
      orderId: row.order_id,
      productId: row.product_id,
      variantId: row.variant_id,
      productName: row.product_name,
      quantity: row.quantity,
      price: row.price,
      total: row.total,
      createdAt: row.created_at,
    }
  }
}
