/**
 * Product Management Routes
 */

import { Hono } from 'hono'

export function createProductRoutes(): Hono {
    const router = new Hono()

    router.get('/', async (c) => {
        try {
            const storeId = c.req.query('store_id')
            if (!storeId) {
                return c.json({ success: false, error: 'store_id is required' }, 400)
            }

            const db = c.env.DB
            const result = await db
                .prepare('SELECT * FROM products WHERE store_id = ? ORDER BY created_at DESC')
                .bind(storeId)
                .all()

            return c.json({
                success: true,
                data: result.results || [],
                count: (result.results || []).length,
            })
        } catch (error) {
            return c.json({ success: false, error: 'Failed to fetch products' }, 500)
        }
    })

    router.post('/', async (c) => {
        try {
            const body = await c.req.json()
            const { storeId, name, slug, price, sku, type } = body

            if (!storeId || !name || !slug || !price || !sku) {
                return c.json({ success: false, error: 'Missing required fields' }, 400)
            }

            const db = c.env.DB
            const id = `prod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            const now = Math.floor(Date.now() / 1000)

            await db
                .prepare(`
          INSERT INTO products (id, store_id, name, slug, price, sku, type, is_active, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `)
                .bind(id, storeId, name, slug, price, sku, type || 'physical', 1, now, now)
                .run()

            return c.json(
                {
                    success: true,
                    data: { id, storeId, name, slug, price, sku, type: type || 'physical' },
                },
                201
            )
        } catch (error) {
            return c.json({ success: false, error: 'Failed to create product' }, 400)
        }
    })

    router.get('/:id', async (c) => {
        try {
            const id = c.req.param('id')
            const db = c.env.DB
            const result = await db.prepare('SELECT * FROM products WHERE id = ?').bind(id).first()

            if (!result) {
                return c.json({ success: false, error: 'Product not found' }, 404)
            }

            return c.json({ success: true, data: result })
        } catch (error) {
            return c.json({ success: false, error: 'Failed to fetch product' }, 500)
        }
    })

    router.put('/:id', async (c) => {
        try {
            const id = c.req.param('id')
            const body = await c.req.json()
            const { name, price, sku } = body

            const db = c.env.DB
            const now = Math.floor(Date.now() / 1000)

            await db
                .prepare('UPDATE products SET name = ?, price = ?, sku = ?, updated_at = ? WHERE id = ?')
                .bind(name, price, sku, now, id)
                .run()

            const result = await db.prepare('SELECT * FROM products WHERE id = ?').bind(id).first()

            return c.json({ success: true, data: result })
        } catch (error) {
            return c.json({ success: false, error: 'Failed to update product' }, 400)
        }
    })

    router.delete('/:id', async (c) => {
        try {
            const id = c.req.param('id')
            const db = c.env.DB

            await db.prepare('DELETE FROM products WHERE id = ?').bind(id).run()

            return c.json({ success: true, message: 'Product deleted successfully' })
        } catch (error) {
            return c.json({ success: false, error: 'Failed to delete product' }, 400)
        }
    })

    return router
}
