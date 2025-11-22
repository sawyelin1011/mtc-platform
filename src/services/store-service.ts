/**
 * Store Service - Multi-store management
 * 
 * Manages store creation, configuration, and multi-store isolation
 */

import type { D1Database } from '@cloudflare/workers-types'

export interface Store {
  id: string
  name: string
  slug: string
  description?: string
  logoUrl?: string
  currency: string
  taxRate: number
  shippingEnabled: boolean
  isActive: boolean
  settings?: Record<string, any>
  createdAt: number
  updatedAt: number
}

export interface CreateStoreInput {
  name: string
  slug: string
  description?: string
  logoUrl?: string
  currency?: string
  taxRate?: number
  shippingEnabled?: boolean
  settings?: Record<string, any>
}

export interface UpdateStoreInput {
  name?: string
  description?: string
  logoUrl?: string
  currency?: string
  taxRate?: number
  shippingEnabled?: boolean
  settings?: Record<string, any>
}

export class StoreService {
  constructor(private db: D1Database) {}

  /**
   * Create a new store
   */
  async createStore(input: CreateStoreInput): Promise<Store> {
    const id = `store_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const now = Math.floor(Date.now() / 1000)

    const store: Store = {
      id,
      name: input.name,
      slug: input.slug,
      description: input.description,
      logoUrl: input.logoUrl,
      currency: input.currency || 'USD',
      taxRate: input.taxRate || 0,
      shippingEnabled: input.shippingEnabled !== false,
      isActive: true,
      settings: input.settings || {},
      createdAt: now,
      updatedAt: now,
    }

    await this.db
      .prepare(`
        INSERT INTO stores 
        (id, name, slug, description, logo_url, currency, tax_rate, shipping_enabled, is_active, settings, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .bind(
        store.id,
        store.name,
        store.slug,
        store.description || null,
        store.logoUrl || null,
        store.currency,
        store.taxRate,
        store.shippingEnabled ? 1 : 0,
        1,
        JSON.stringify(store.settings),
        store.createdAt,
        store.updatedAt
      )
      .run()

    return store
  }

  /**
   * Get store by ID
   */
  async getStore(id: string): Promise<Store | null> {
    const result = await this.db
      .prepare('SELECT * FROM stores WHERE id = ?')
      .bind(id)
      .first()

    if (!result) return null

    return this.mapRowToStore(result)
  }

  /**
   * Get store by slug
   */
  async getStoreBySlug(slug: string): Promise<Store | null> {
    const result = await this.db
      .prepare('SELECT * FROM stores WHERE slug = ?')
      .bind(slug)
      .first()

    if (!result) return null

    return this.mapRowToStore(result)
  }

  /**
   * Get all stores
   */
  async getAllStores(activeOnly: boolean = false): Promise<Store[]> {
    let query = 'SELECT * FROM stores'
    if (activeOnly) {
      query += ' WHERE is_active = 1'
    }
    query += ' ORDER BY created_at DESC'

    const result = await this.db.prepare(query).all()

    return (result.results || []).map(row => this.mapRowToStore(row))
  }

  /**
   * Update store
   */
  async updateStore(id: string, input: UpdateStoreInput): Promise<Store> {
    const store = await this.getStore(id)
    if (!store) throw new Error(`Store not found: ${id}`)

    const now = Math.floor(Date.now() / 1000)
    const updated: Store = {
      ...store,
      ...input,
      id: store.id,
      createdAt: store.createdAt,
      updatedAt: now,
    }

    await this.db
      .prepare(`
        UPDATE stores 
        SET name = ?, description = ?, logo_url = ?, currency = ?, tax_rate = ?, 
            shipping_enabled = ?, settings = ?, updated_at = ?
        WHERE id = ?
      `)
      .bind(
        updated.name,
        updated.description || null,
        updated.logoUrl || null,
        updated.currency,
        updated.taxRate,
        updated.shippingEnabled ? 1 : 0,
        JSON.stringify(updated.settings || {}),
        updated.updatedAt,
        id
      )
      .run()

    return updated
  }

  /**
   * Activate store
   */
  async activateStore(id: string): Promise<void> {
    await this.db
      .prepare('UPDATE stores SET is_active = 1, updated_at = ? WHERE id = ?')
      .bind(Math.floor(Date.now() / 1000), id)
      .run()
  }

  /**
   * Deactivate store
   */
  async deactivateStore(id: string): Promise<void> {
    await this.db
      .prepare('UPDATE stores SET is_active = 0, updated_at = ? WHERE id = ?')
      .bind(Math.floor(Date.now() / 1000), id)
      .run()
  }

  /**
   * Delete store
   */
  async deleteStore(id: string): Promise<void> {
    await this.db.prepare('DELETE FROM stores WHERE id = ?').bind(id).run()
  }

  /**
   * Get store settings
   */
  async getStoreSettings(id: string): Promise<Record<string, any>> {
    const store = await this.getStore(id)
    if (!store) throw new Error(`Store not found: ${id}`)
    return store.settings || {}
  }

  /**
   * Update store settings
   */
  async updateStoreSettings(id: string, settings: Record<string, any>): Promise<void> {
    const store = await this.getStore(id)
    if (!store) throw new Error(`Store not found: ${id}`)

    const updated = { ...store.settings, ...settings }

    await this.db
      .prepare('UPDATE stores SET settings = ?, updated_at = ? WHERE id = ?')
      .bind(JSON.stringify(updated), Math.floor(Date.now() / 1000), id)
      .run()
  }

  /**
   * Map database row to Store object
   */
  private mapRowToStore(row: any): Store {
    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      description: row.description,
      logoUrl: row.logo_url,
      currency: row.currency,
      taxRate: row.tax_rate,
      shippingEnabled: row.shipping_enabled === 1,
      isActive: row.is_active === 1,
      settings: row.settings ? JSON.parse(row.settings) : {},
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }
  }
}
