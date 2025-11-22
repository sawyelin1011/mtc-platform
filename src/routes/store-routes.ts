/**
 * Store Management Routes
 * Handles store CRUD operations
 */

import type { Context } from 'hono'
import { Hono } from 'hono'

export function createStoreRoutes(): Hono {
    const router = new Hono()

    /**
     * GET /api/stores
     * List all stores
     */
    router.get('/', async (c: Context) => {
        try {
            const db = c.env.DB
            const result = await db.prepare('SELECT * FROM stores ORDER BY created_at DESC').all()

            return c.json({
                success: true,
                data: result.results || [],
                count: (result.results || []).length,
            })
        } catch (error) {
            return c.json(
                {
                    success: false,
                    error: 'Failed to fetch stores',
                    message: error instanceof Error ? error.message : 'Unknown error',
                },
                500
            )
        }
    })

    /**
     * POST /api/stores
     * Create a new store
     */
    router.post('/', async (c: Context) => {
        try {
            const body = await c.req.json()
            const { name, slug, description, currency, taxRate } = body

            if (!name || !slug) {
                return c.json(
                    {
                        success: false,
                        error: 'Missing required fields: name, slug',
                    },
                    400
                )
            }

            const db = c.env.DB
            const id = `store_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            const now = Math.floor(Date.now() / 1000)

            await db
                .prepare(`
          INSERT INTO stores (id, name, slug, description, currency, tax_rate, is_active, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `)
                .bind(id, name, slug, description || null, currency || 'USD', taxRate || 0, 1, now, now)
                .run()

            return c.json(
                {
                    success: true,
                    data: {
                        id,
                        name,
                        slug,
                        description,
                        currency: currency || 'USD',
                        taxRate: taxRate || 0,
                        isActive: true,
                        createdAt: now,
                        updatedAt: now,
                    },
                },
                201
            )
        } catch (error) {
            return c.json(
                {
                    success: false,
                    error: 'Failed to create store',
                    message: error instanceof Error ? error.message : 'Unknown error',
                },
                400
            )
        }
    })

    /**
     * GET /api/stores/:id
     * Get a specific store
     */
    router.get('/:id', async (c: Context) => {
        try {
            const id = c.req.param('id')
            const db = c.env.DB
            const result = await db.prepare('SELECT * FROM stores WHERE id = ?').bind(id).first()

            if (!result) {
                return c.json(
                    {
                        success: false,
                        error: 'Store not found',
                    },
                    404
                )
            }

            return c.json({
                success: true,
                data: result,
            })
        } catch (error) {
            return c.json(
                {
                    success: false,
                    error: 'Failed to fetch store',
                    message: error instanceof Error ? error.message : 'Unknown error',
                },
                500
            )
        }
    })

    /**
     * PUT /api/stores/:id
     * Update a store
     */
    router.put('/:id', async (c: Context) => {
        try {
            const id = c.req.param('id')
            const body = await c.req.json()
            const { name, description, currency, taxRate } = body

            const db = c.env.DB
            const now = Math.floor(Date.now() / 1000)

            await db
                .prepare(`
          UPDATE stores 
          SET name = ?, description = ?, currency = ?, tax_rate = ?, updated_at = ?
          WHERE id = ?
        `)
                .bind(name, description || null, currency, taxRate || 0, now, id)
                .run()

            const result = await db.prepare('SELECT * FROM stores WHERE id = ?').bind(id).first()

            return c.json({
                success: true,
                data: result,
            })
        } catch (error) {
            return c.json(
                {
                    success: false,
                    error: 'Failed to update store',
                    message: error instanceof Error ? error.message : 'Unknown error',
                },
                400
            )
        }
    })

    /**
     * DELETE /api/stores/:id
     * Delete a store
     */
    router.delete('/:id', async (c: Context) => {
        try {
            const id = c.req.param('id')
            const db = c.env.DB

            await db.prepare('DELETE FROM stores WHERE id = ?').bind(id).run()

            return c.json({
                success: true,
                message: 'Store deleted successfully',
            })
        } catch (error) {
            return c.json(
                {
                    success: false,
                    error: 'Failed to delete store',
                    message: error instanceof Error ? error.message : 'Unknown error',
                },
                400
            )
        }
    })

    return router
}
