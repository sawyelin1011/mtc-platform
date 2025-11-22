/**
 * Product Service - Product management with variants and inventory
 * 
 * Manages products, variants, categories, and inventory
 */

import type { D1Database } from '@cloudflare/workers-types'

export interface Product {
  id: string
  storeId: string
  name: string
  slug: string
  description?: string
  type: 'physical' | 'digital'
  sku?: string
  price: number
  cost?: number
  stockQuantity: number
  weight?: number
  dimensions?: string
  imageUrl?: string
  galleryUrls?: string[]
  isActive: boolean
  isFeatured: boolean
  metadata?: Record<string, any>
  createdAt: number
  updatedAt: number
}

export interface ProductVariant {
  id: string
  productId: string
  name: string
  sku?: string
  price?: number
  stockQuantity: number
  imageUrl?: string
  metadata?: Record<string, any>
  createdAt: number
}

export interface ProductCategory {
  id: string
  storeId: string
  name: string
  slug: string
  description?: string
  imageUrl?: string
  parentId?: string
  isActive: boolean
  createdAt: number
}

export interface CreateProductInput {
  name: string
  slug: string
  description?: string
  type: 'physical' | 'digital'
  sku?: string
  price: number
  cost?: number
  stockQuantity?: number
  weight?: number
  dimensions?: string
  imageUrl?: string
  galleryUrls?: string[]
  isFeatured?: boolean
  metadata?: Record<string, any>
}

export interface UpdateProductInput {
  name?: string
  description?: string
  price?: number
  cost?: number
  stockQuantity?: number
  weight?: number
  dimensions?: string
  imageUrl?: string
  galleryUrls?: string[]
  isFeatured?: boolean
  metadata?: Record<string, any>
}

export class ProductService {
  constructor(private db: D1Database) {}

  /**
   * Create a product
   */
  async createProduct(storeId: string, input: CreateProductInput): Promise<Product> {
    const id = `prod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const now = Math.floor(Date.now() / 1000)

    const product: Product = {
      id,
      storeId,
      name: input.name,
      slug: input.slug,
      description: input.description,
      type: input.type,
      sku: input.sku,
      price: input.price,
      cost: input.cost,
      stockQuantity: input.stockQuantity || 0,
      weight: input.weight,
      dimensions: input.dimensions,
      imageUrl: input.imageUrl,
      galleryUrls: input.galleryUrls,
      isActive: true,
      isFeatured: input.isFeatured || false,
      metadata: input.metadata,
      createdAt: now,
      updatedAt: now,
    }

    await this.db
      .prepare(`
        INSERT INTO products 
        (id, store_id, name, slug, description, type, sku, price, cost, stock_quantity, 
         weight, dimensions, image_url, gallery_urls, is_active, is_featured, metadata, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .bind(
        product.id,
        product.storeId,
        product.name,
        product.slug,
        product.description || null,
        product.type,
        product.sku || null,
        product.price,
        product.cost || null,
        product.stockQuantity,
        product.weight || null,
        product.dimensions || null,
        product.imageUrl || null,
        product.galleryUrls ? JSON.stringify(product.galleryUrls) : null,
        1,
        product.isFeatured ? 1 : 0,
        product.metadata ? JSON.stringify(product.metadata) : null,
        product.createdAt,
        product.updatedAt
      )
      .run()

    return product
  }

  /**
   * Get product by ID
   */
  async getProduct(id: string): Promise<Product | null> {
    const result = await this.db
      .prepare('SELECT * FROM products WHERE id = ?')
      .bind(id)
      .first()

    if (!result) return null
    return this.mapRowToProduct(result)
  }

  /**
   * Get products by store
   */
  async getStoreProducts(storeId: string, activeOnly: boolean = true): Promise<Product[]> {
    let query = 'SELECT * FROM products WHERE store_id = ?'
    if (activeOnly) {
      query += ' AND is_active = 1'
    }
    query += ' ORDER BY created_at DESC'

    const result = await this.db.prepare(query).bind(storeId).all()
    return (result.results || []).map(row => this.mapRowToProduct(row))
  }

  /**
   * Get featured products
   */
  async getFeaturedProducts(storeId: string, limit: number = 10): Promise<Product[]> {
    const result = await this.db
      .prepare(
        'SELECT * FROM products WHERE store_id = ? AND is_featured = 1 AND is_active = 1 ORDER BY created_at DESC LIMIT ?'
      )
      .bind(storeId, limit)
      .all()

    return (result.results || []).map(row => this.mapRowToProduct(row))
  }

  /**
   * Update product
   */
  async updateProduct(id: string, input: UpdateProductInput): Promise<Product> {
    const product = await this.getProduct(id)
    if (!product) throw new Error(`Product not found: ${id}`)

    const now = Math.floor(Date.now() / 1000)
    const updated: Product = {
      ...product,
      ...input,
      id: product.id,
      storeId: product.storeId,
      type: product.type,
      createdAt: product.createdAt,
      updatedAt: now,
    }

    await this.db
      .prepare(`
        UPDATE products 
        SET name = ?, description = ?, price = ?, cost = ?, stock_quantity = ?, 
            weight = ?, dimensions = ?, image_url = ?, gallery_urls = ?, 
            is_featured = ?, metadata = ?, updated_at = ?
        WHERE id = ?
      `)
      .bind(
        updated.name,
        updated.description || null,
        updated.price,
        updated.cost || null,
        updated.stockQuantity,
        updated.weight || null,
        updated.dimensions || null,
        updated.imageUrl || null,
        updated.galleryUrls ? JSON.stringify(updated.galleryUrls) : null,
        updated.isFeatured ? 1 : 0,
        updated.metadata ? JSON.stringify(updated.metadata) : null,
        updated.updatedAt,
        id
      )
      .run()

    return updated
  }

  /**
   * Update product stock
   */
  async updateStock(id: string, quantity: number): Promise<void> {
    await this.db
      .prepare('UPDATE products SET stock_quantity = ?, updated_at = ? WHERE id = ?')
      .bind(quantity, Math.floor(Date.now() / 1000), id)
      .run()
  }

  /**
   * Decrease stock
   */
  async decreaseStock(id: string, quantity: number): Promise<void> {
    await this.db
      .prepare(
        'UPDATE products SET stock_quantity = MAX(0, stock_quantity - ?), updated_at = ? WHERE id = ?'
      )
      .bind(quantity, Math.floor(Date.now() / 1000), id)
      .run()
  }

  /**
   * Activate product
   */
  async activateProduct(id: string): Promise<void> {
    await this.db
      .prepare('UPDATE products SET is_active = 1, updated_at = ? WHERE id = ?')
      .bind(Math.floor(Date.now() / 1000), id)
      .run()
  }

  /**
   * Deactivate product
   */
  async deactivateProduct(id: string): Promise<void> {
    await this.db
      .prepare('UPDATE products SET is_active = 0, updated_at = ? WHERE id = ?')
      .bind(Math.floor(Date.now() / 1000), id)
      .run()
  }

  /**
   * Delete product
   */
  async deleteProduct(id: string): Promise<void> {
    await this.db.prepare('DELETE FROM products WHERE id = ?').bind(id).run()
  }

  /**
   * Create product variant
   */
  async createVariant(productId: string, input: Omit<ProductVariant, 'id' | 'productId' | 'createdAt'>): Promise<ProductVariant> {
    const id = `var_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const now = Math.floor(Date.now() / 1000)

    const variant: ProductVariant = {
      id,
      productId,
      name: input.name,
      sku: input.sku,
      price: input.price,
      stockQuantity: input.stockQuantity,
      imageUrl: input.imageUrl,
      metadata: input.metadata,
      createdAt: now,
    }

    await this.db
      .prepare(`
        INSERT INTO product_variants 
        (id, product_id, name, sku, price, stock_quantity, image_url, metadata, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .bind(
        variant.id,
        variant.productId,
        variant.name,
        variant.sku || null,
        variant.price || null,
        variant.stockQuantity,
        variant.imageUrl || null,
        variant.metadata ? JSON.stringify(variant.metadata) : null,
        variant.createdAt
      )
      .run()

    return variant
  }

  /**
   * Get product variants
   */
  async getVariants(productId: string): Promise<ProductVariant[]> {
    const result = await this.db
      .prepare('SELECT * FROM product_variants WHERE product_id = ? ORDER BY created_at ASC')
      .bind(productId)
      .all()

    return (result.results || []).map(row => this.mapRowToVariant(row))
  }

  /**
   * Delete variant
   */
  async deleteVariant(id: string): Promise<void> {
    await this.db.prepare('DELETE FROM product_variants WHERE id = ?').bind(id).run()
  }

  /**
   * Create category
   */
  async createCategory(storeId: string, input: Omit<ProductCategory, 'id' | 'storeId' | 'createdAt'>): Promise<ProductCategory> {
    const id = `cat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const now = Math.floor(Date.now() / 1000)

    const category: ProductCategory = {
      id,
      storeId,
      name: input.name,
      slug: input.slug,
      description: input.description,
      imageUrl: input.imageUrl,
      parentId: input.parentId,
      isActive: true,
      createdAt: now,
    }

    await this.db
      .prepare(`
        INSERT INTO product_categories 
        (id, store_id, name, slug, description, image_url, parent_id, is_active, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .bind(
        category.id,
        category.storeId,
        category.name,
        category.slug,
        category.description || null,
        category.imageUrl || null,
        category.parentId || null,
        1,
        category.createdAt
      )
      .run()

    return category
  }

  /**
   * Get categories
   */
  async getCategories(storeId: string): Promise<ProductCategory[]> {
    const result = await this.db
      .prepare('SELECT * FROM product_categories WHERE store_id = ? AND is_active = 1 ORDER BY name ASC')
      .bind(storeId)
      .all()

    return (result.results || []).map(row => this.mapRowToCategory(row))
  }

  /**
   * Map database row to Product
   */
  private mapRowToProduct(row: any): Product {
    return {
      id: row.id,
      storeId: row.store_id,
      name: row.name,
      slug: row.slug,
      description: row.description,
      type: row.type,
      sku: row.sku,
      price: row.price,
      cost: row.cost,
      stockQuantity: row.stock_quantity,
      weight: row.weight,
      dimensions: row.dimensions,
      imageUrl: row.image_url,
      galleryUrls: row.gallery_urls ? JSON.parse(row.gallery_urls) : [],
      isActive: row.is_active === 1,
      isFeatured: row.is_featured === 1,
      metadata: row.metadata ? JSON.parse(row.metadata) : {},
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }
  }

  /**
   * Map database row to ProductVariant
   */
  private mapRowToVariant(row: any): ProductVariant {
    return {
      id: row.id,
      productId: row.product_id,
      name: row.name,
      sku: row.sku,
      price: row.price,
      stockQuantity: row.stock_quantity,
      imageUrl: row.image_url,
      metadata: row.metadata ? JSON.parse(row.metadata) : {},
      createdAt: row.created_at,
    }
  }

  /**
   * Map database row to ProductCategory
   */
  private mapRowToCategory(row: any): ProductCategory {
    return {
      id: row.id,
      storeId: row.store_id,
      name: row.name,
      slug: row.slug,
      description: row.description,
      imageUrl: row.image_url,
      parentId: row.parent_id,
      isActive: row.is_active === 1,
      createdAt: row.created_at,
    }
  }
}
