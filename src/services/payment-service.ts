/**
 * Payment Service - Payment gateway integration
 * 
 * Manages payment processing with pluggable gateway architecture
 */

import type { D1Database } from '@cloudflare/workers-types'

export type PaymentGateway = 'stripe' | 'paypal' | 'square' | 'custom'
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded'

export interface Payment {
  id: string
  orderId: string
  paymentMethodId: string
  amount: number
  currency: string
  status: PaymentStatus
  transactionId?: string
  errorMessage?: string
  metadata?: Record<string, any>
  createdAt: number
  updatedAt: number
}

export interface PaymentMethod {
  id: string
  storeId: string
  name: string
  type: PaymentGateway
  isActive: boolean
  config: Record<string, any>
  createdAt: number
}

export interface Refund {
  id: string
  orderId: string
  paymentId?: string
  amount: number
  reason?: string
  status: 'pending' | 'completed' | 'failed'
  transactionId?: string
  createdAt: number
  updatedAt: number
}

export interface CreatePaymentInput {
  orderId: string
  paymentMethodId: string
  amount: number
  currency?: string
  metadata?: Record<string, any>
}

export interface ProcessPaymentInput {
  paymentMethodType: PaymentGateway
  amount: number
  currency: string
  orderId: string
  metadata?: Record<string, any>
}

export class PaymentService {
  private gateways = new Map<PaymentGateway, PaymentGatewayHandler>()

  constructor(private db: D1Database) {}

  /**
   * Register a payment gateway
   */
  registerGateway(type: PaymentGateway, handler: PaymentGatewayHandler): void {
    this.gateways.set(type, handler)
  }

  /**
   * Create a payment method
   */
  async createPaymentMethod(
    storeId: string,
    name: string,
    type: PaymentGateway,
    config: Record<string, any>
  ): Promise<PaymentMethod> {
    const id = `pm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const now = Math.floor(Date.now() / 1000)

    const method: PaymentMethod = {
      id,
      storeId,
      name,
      type,
      isActive: true,
      config,
      createdAt: now,
    }

    await this.db
      .prepare(`
        INSERT INTO payment_methods 
        (id, store_id, name, type, is_active, config, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `)
      .bind(id, storeId, name, type, 1, JSON.stringify(config), now)
      .run()

    return method
  }

  /**
   * Get payment method
   */
  async getPaymentMethod(id: string): Promise<PaymentMethod | null> {
    const result = await this.db
      .prepare('SELECT * FROM payment_methods WHERE id = ?')
      .bind(id)
      .first()

    if (!result) return null
    return this.mapRowToPaymentMethod(result)
  }

  /**
   * Get store payment methods
   */
  async getStorePaymentMethods(storeId: string): Promise<PaymentMethod[]> {
    const result = await this.db
      .prepare('SELECT * FROM payment_methods WHERE store_id = ? AND is_active = 1 ORDER BY created_at DESC')
      .bind(storeId)
      .all()

    return (result.results || []).map(row => this.mapRowToPaymentMethod(row))
  }

  /**
   * Create a payment
   */
  async createPayment(input: CreatePaymentInput): Promise<Payment> {
    const id = `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const now = Math.floor(Date.now() / 1000)

    const payment: Payment = {
      id,
      orderId: input.orderId,
      paymentMethodId: input.paymentMethodId,
      amount: input.amount,
      currency: input.currency || 'USD',
      status: 'pending',
      metadata: input.metadata,
      createdAt: now,
      updatedAt: now,
    }

    await this.db
      .prepare(`
        INSERT INTO payments 
        (id, order_id, payment_method_id, amount, currency, status, metadata, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .bind(
        payment.id,
        payment.orderId,
        payment.paymentMethodId,
        payment.amount,
        payment.currency,
        payment.status,
        payment.metadata ? JSON.stringify(payment.metadata) : null,
        payment.createdAt,
        payment.updatedAt
      )
      .run()

    return payment
  }

  /**
   * Get payment
   */
  async getPayment(id: string): Promise<Payment | null> {
    const result = await this.db
      .prepare('SELECT * FROM payments WHERE id = ?')
      .bind(id)
      .first()

    if (!result) return null
    return this.mapRowToPayment(result)
  }

  /**
   * Process payment
   */
  async processPayment(input: ProcessPaymentInput): Promise<Payment> {
    const payment = await this.createPayment({
      orderId: input.orderId,
      paymentMethodId: '', // Will be set by gateway
      amount: input.amount,
      currency: input.currency,
      metadata: input.metadata,
    })

    const gateway = this.gateways.get(input.paymentMethodType)
    if (!gateway) {
      throw new Error(`Payment gateway not registered: ${input.paymentMethodType}`)
    }

    try {
      const result = await gateway.process({
        amount: input.amount,
        currency: input.currency,
        orderId: input.orderId,
        metadata: input.metadata,
      })

      // Update payment with transaction ID
      await this.db
        .prepare('UPDATE payments SET status = ?, transaction_id = ?, updated_at = ? WHERE id = ?')
        .bind('completed', result.transactionId, Math.floor(Date.now() / 1000), payment.id)
        .run()

      payment.status = 'completed'
      payment.transactionId = result.transactionId
      payment.updatedAt = Math.floor(Date.now() / 1000)

      return payment
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'

      await this.db
        .prepare('UPDATE payments SET status = ?, error_message = ?, updated_at = ? WHERE id = ?')
        .bind('failed', errorMessage, Math.floor(Date.now() / 1000), payment.id)
        .run()

      payment.status = 'failed'
      payment.errorMessage = errorMessage
      payment.updatedAt = Math.floor(Date.now() / 1000)

      throw error
    }
  }

  /**
   * Create refund
   */
  async createRefund(
    orderId: string,
    paymentId: string,
    amount: number,
    reason?: string
  ): Promise<Refund> {
    const id = `ref_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const now = Math.floor(Date.now() / 1000)

    const refund: Refund = {
      id,
      orderId,
      paymentId,
      amount,
      reason,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    }

    await this.db
      .prepare(`
        INSERT INTO refunds 
        (id, order_id, payment_id, amount, reason, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .bind(
        refund.id,
        refund.orderId,
        refund.paymentId,
        refund.amount,
        refund.reason || null,
        refund.status,
        refund.createdAt,
        refund.updatedAt
      )
      .run()

    return refund
  }

  /**
   * Get refund
   */
  async getRefund(id: string): Promise<Refund | null> {
    const result = await this.db
      .prepare('SELECT * FROM refunds WHERE id = ?')
      .bind(id)
      .first()

    if (!result) return null
    return this.mapRowToRefund(result)
  }

  /**
   * Get order refunds
   */
  async getOrderRefunds(orderId: string): Promise<Refund[]> {
    const result = await this.db
      .prepare('SELECT * FROM refunds WHERE order_id = ? ORDER BY created_at DESC')
      .bind(orderId)
      .all()

    return (result.results || []).map(row => this.mapRowToRefund(row))
  }

  /**
   * Process refund
   */
  async processRefund(refundId: string): Promise<Refund> {
    const refund = await this.getRefund(refundId)
    if (!refund) throw new Error(`Refund not found: ${refundId}`)

    if (!refund.paymentId) {
      throw new Error('Cannot refund payment without payment ID')
    }

    const payment = await this.getPayment(refund.paymentId)
    if (!payment) throw new Error(`Payment not found: ${refund.paymentId}`)

    const gateway = this.gateways.get('stripe') // Default to stripe for now
    if (!gateway) {
      throw new Error('Payment gateway not available for refunds')
    }

    try {
      const result = await gateway.refund({
        transactionId: payment.transactionId || '',
        amount: refund.amount,
        currency: payment.currency,
      })

      await this.db
        .prepare('UPDATE refunds SET status = ?, transaction_id = ?, updated_at = ? WHERE id = ?')
        .bind('completed', result.transactionId, Math.floor(Date.now() / 1000), refundId)
        .run()

      refund.status = 'completed'
      refund.transactionId = result.transactionId
      refund.updatedAt = Math.floor(Date.now() / 1000)

      return refund
    } catch (error) {
      await this.db
        .prepare('UPDATE refunds SET status = ?, updated_at = ? WHERE id = ?')
        .bind('failed', Math.floor(Date.now() / 1000), refundId)
        .run()

      throw error
    }
  }

  /**
   * Map database row to Payment
   */
  private mapRowToPayment(row: any): Payment {
    return {
      id: row.id,
      orderId: row.order_id,
      paymentMethodId: row.payment_method_id,
      amount: row.amount,
      currency: row.currency,
      status: row.status,
      transactionId: row.transaction_id,
      errorMessage: row.error_message,
      metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }
  }

  /**
   * Map database row to PaymentMethod
   */
  private mapRowToPaymentMethod(row: any): PaymentMethod {
    return {
      id: row.id,
      storeId: row.store_id,
      name: row.name,
      type: row.type,
      isActive: row.is_active === 1,
      config: row.config ? JSON.parse(row.config) : {},
      createdAt: row.created_at,
    }
  }

  /**
   * Map database row to Refund
   */
  private mapRowToRefund(row: any): Refund {
    return {
      id: row.id,
      orderId: row.order_id,
      paymentId: row.payment_id,
      amount: row.amount,
      reason: row.reason,
      status: row.status,
      transactionId: row.transaction_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }
  }
}

/**
 * Payment gateway handler interface
 */
export interface PaymentGatewayHandler {
  process(input: {
    amount: number
    currency: string
    orderId: string
    metadata?: Record<string, any>
  }): Promise<{ transactionId: string }>

  refund(input: {
    transactionId: string
    amount: number
    currency: string
  }): Promise<{ transactionId: string }>
}
