/**
 * Cart Service - Shopping cart management
 * 
 * Manages shopping carts, items, and cart calculations
 */

import type { D1Database } from '@cloudflare/workers-types'

export interface Cart {
  id: string
  storeId: string
  userId?: string
  sessionId?: string
  totalPrice: number
  totalTax: number
  totalShipping: number
  couponCode?: string
  couponDiscount: number
  expiresAt?: number
  createdAt: number
  updatedAt: number
}

export interface CartItem {
  id: string
  cartId: string
  productId: string
  variantId?: string
  quantity: number
  price: number
  createdAt: number
}

export interface CreateCartInput {
  storeId: string
  userId?: string
  sessionId?: string
}

export interface AddCartItemInput {
  productId: string
  variantId?: string
  quantity: number
  price: number
}

export class CartService {
  constructor(private db: D1Database) {}

  /**
   * Create a cart
   */
  async createCart(input: CreateCartInput): Promise<Cart> {
    const id = `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const now = Math.floor(Date.now() / 1000)
    const expiresAt = now + 30 * 24 * 60 * 60 // 30 days

    const cart: Cart = {
      id,
      storeId: input.storeId,
      userId: input.userId,
      sessionId: input.sessionId,
      totalPrice: 0,
      totalTax: 0,
      totalShipping: 0,
      couponDiscount: 0,
      expiresAt,
      createdAt: now,
      updatedAt: now,
    }

    await this.db
      .prepare(`
        INSERT INTO carts 
        (id, store_id, user_id, session_id, total_price, total_tax, total_shipping, coupon_discount, expires_at, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .bind(
        cart.id,
        cart.storeId,
        cart.userId || null,
        cart.sessionId || null,
        cart.totalPrice,
        cart.totalTax,
        cart.totalShipping,
        cart.couponDiscount,
        cart.expiresAt,
        cart.createdAt,
        cart.updatedAt
      )
      .run()

    return cart
  }

  /**
   * Get cart by ID
   */
  async getCart(id: string): Promise<Cart | null> {
    const result = await this.db
      .prepare('SELECT * FROM carts WHERE id = ?')
      .bind(id)
      .first()

    if (!result) return null
    return this.mapRowToCart(result)
  }

  /**
   * Get user's active cart
   */
  async getUserCart(storeId: string, userId: string): Promise<Cart | null> {
    const result = await this.db
      .prepare('SELECT * FROM carts WHERE store_id = ? AND user_id = ? AND expires_at > ? ORDER BY created_at DESC LIMIT 1')
      .bind(storeId, userId, Math.floor(Date.now() / 1000))
      .first()

    if (!result) return null
    return this.mapRowToCart(result)
  }

  /**
   * Get session cart
   */
  async getSessionCart(storeId: string, sessionId: string): Promise<Cart | null> {
    const result = await this.db
      .prepare('SELECT * FROM carts WHERE store_id = ? AND session_id = ? AND expires_at > ? ORDER BY created_at DESC LIMIT 1')
      .bind(storeId, sessionId, Math.floor(Date.now() / 1000))
      .first()

    if (!result) return null
    return this.mapRowToCart(result)
  }

  /**
   * Add item to cart
   */
  async addItem(cartId: string, input: AddCartItemInput): Promise<CartItem> {
    const id = `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const now = Math.floor(Date.now() / 1000)

    const item: CartItem = {
      id,
      cartId,
      productId: input.productId,
      variantId: input.variantId,
      quantity: input.quantity,
      price: input.price,
      createdAt: now,
    }

    await this.db
      .prepare(`
        INSERT INTO cart_items 
        (id, cart_id, product_id, variant_id, quantity, price, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `)
      .bind(
        item.id,
        item.cartId,
        item.productId,
        item.variantId || null,
        item.quantity,
        item.price,
        item.createdAt
      )
      .run()

    // Recalculate cart totals
    await this.recalculateCart(cartId)

    return item
  }

  /**
   * Update cart item quantity
   */
  async updateItem(itemId: string, quantity: number): Promise<void> {
    const item = await this.db
      .prepare('SELECT * FROM cart_items WHERE id = ?')
      .bind(itemId)
      .first()

    if (!item) throw new Error(`Cart item not found: ${itemId}`)

    if (quantity <= 0) {
      await this.removeItem(itemId)
    } else {
      await this.db
        .prepare('UPDATE cart_items SET quantity = ? WHERE id = ?')
        .bind(quantity, itemId)
        .run()

      // Recalculate cart totals
      await this.recalculateCart(item.cart_id)
    }
  }

  /**
   * Remove item from cart
   */
  async removeItem(itemId: string): Promise<void> {
    const item = await this.db
      .prepare('SELECT * FROM cart_items WHERE id = ?')
      .bind(itemId)
      .first()

    if (!item) throw new Error(`Cart item not found: ${itemId}`)

    await this.db.prepare('DELETE FROM cart_items WHERE id = ?').bind(itemId).run()

    // Recalculate cart totals
    await this.recalculateCart(item.cart_id)
  }

  /**
   * Get cart items
   */
  async getItems(cartId: string): Promise<CartItem[]> {
    const result = await this.db
      .prepare('SELECT * FROM cart_items WHERE cart_id = ? ORDER BY created_at ASC')
      .bind(cartId)
      .all()

    return (result.results || []).map(row => this.mapRowToCartItem(row))
  }

  /**
   * Clear cart
   */
  async clearCart(cartId: string): Promise<void> {
    await this.db.prepare('DELETE FROM cart_items WHERE cart_id = ?').bind(cartId).run()

    // Reset cart totals
    await this.db
      .prepare(
        'UPDATE carts SET total_price = 0, total_tax = 0, total_shipping = 0, coupon_discount = 0, updated_at = ? WHERE id = ?'
      )
      .bind(Math.floor(Date.now() / 1000), cartId)
      .run()
  }

  /**
   * Apply coupon to cart
   */
  async applyCoupon(cartId: string, couponCode: string, discount: number): Promise<void> {
    await this.db
      .prepare('UPDATE carts SET coupon_code = ?, coupon_discount = ?, updated_at = ? WHERE id = ?')
      .bind(couponCode, discount, Math.floor(Date.now() / 1000), cartId)
      .run()

    // Recalculate cart totals
    await this.recalculateCart(cartId)
  }

  /**
   * Remove coupon from cart
   */
  async removeCoupon(cartId: string): Promise<void> {
    await this.db
      .prepare('UPDATE carts SET coupon_code = NULL, coupon_discount = 0, updated_at = ? WHERE id = ?')
      .bind(Math.floor(Date.now() / 1000), cartId)
      .run()

    // Recalculate cart totals
    await this.recalculateCart(cartId)
  }

  /**
   * Recalculate cart totals
   */
  async recalculateCart(cartId: string): Promise<void> {
    const cart = await this.getCart(cartId)
    if (!cart) throw new Error(`Cart not found: ${cartId}`)

    const items = await this.getItems(cartId)

    // Calculate subtotal
    let subtotal = 0
    for (const item of items) {
      subtotal += item.price * item.quantity
    }

    // Get store for tax rate
    const storeResult = await this.db
      .prepare('SELECT tax_rate FROM stores WHERE id = ?')
      .bind(cart.storeId)
      .first()

    const taxRate = storeResult?.tax_rate || 0
    const tax = subtotal * (taxRate / 100)

    // Calculate total
    const total = subtotal + tax + cart.totalShipping - cart.couponDiscount

    await this.db
      .prepare(
        'UPDATE carts SET total_price = ?, total_tax = ?, updated_at = ? WHERE id = ?'
      )
      .bind(total, tax, Math.floor(Date.now() / 1000), cartId)
      .run()
  }

  /**
   * Set shipping cost
   */
  async setShipping(cartId: string, shippingCost: number): Promise<void> {
    await this.db
      .prepare('UPDATE carts SET total_shipping = ?, updated_at = ? WHERE id = ?')
      .bind(shippingCost, Math.floor(Date.now() / 1000), cartId)
      .run()

    // Recalculate cart totals
    await this.recalculateCart(cartId)
  }

  /**
   * Delete expired carts
   */
  async deleteExpiredCarts(): Promise<void> {
    await this.db
      .prepare('DELETE FROM carts WHERE expires_at < ?')
      .bind(Math.floor(Date.now() / 1000))
      .run()
  }

  /**
   * Map database row to Cart
   */
  private mapRowToCart(row: any): Cart {
    return {
      id: row.id,
      storeId: row.store_id,
      userId: row.user_id,
      sessionId: row.session_id,
      totalPrice: row.total_price,
      totalTax: row.total_tax,
      totalShipping: row.total_shipping,
      couponCode: row.coupon_code,
      couponDiscount: row.coupon_discount,
      expiresAt: row.expires_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }
  }

  /**
   * Map database row to CartItem
   */
  private mapRowToCartItem(row: any): CartItem {
    return {
      id: row.id,
      cartId: row.cart_id,
      productId: row.product_id,
      variantId: row.variant_id,
      quantity: row.quantity,
      price: row.price,
      createdAt: row.created_at,
    }
  }
}
