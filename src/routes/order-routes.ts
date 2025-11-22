import { Hono } from 'hono'

export function createOrderRoutes(): Hono {
    const router = new Hono()

    router.get('/', async (c) => {
        try {
            const storeId = c.req.query('store_id')
            if (!storeId) return c.json({ success: false, error: 'store_id required' }, 400)

            const db = c.env.DB
            const result = await db
                .prepare('SELECT * FROM orders WHERE store_id = ? ORDER BY created_at DESC')
                .bind(storeId)
                .all()

            return c.json({ success: true, data: result.results || [], count: (result.results || []).length })
        } catch (error) {
            return c.json({ success: false, error: 'Failed to fetch orders' }, 500)
        }
    })

    router.post('/', async (c) => {
        try {
            const body = await c.req.json()
            const { storeId, email, total } = body

            if (!storeId || !email || !total) {
                return c.json({ success: false, error: 'Missing required fields' }, 400)
            }

            const db = c.env.DB
            const id = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            const orderNumber = `ORD-${Date.now()}`
            const now = Math.floor(Date.now() / 1000)

            await db
                .prepare(`
          INSERT INTO orders (id, store_id, order_number, email, total, subtotal, status, payment_status, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `)
                .bind(id, storeId, orderNumber, email, total, total, 'pending', 'unpaid', now, now)
                .run()

            return c.json({ success: true, data: { id, orderNumber, email, total } }, 201)
        } catch (error) {
            return c.json({ success: false, error: 'Failed to create order' }, 400)
        }
    })

    router.get('/:id', async (c) => {
        try {
            const id = c.req.param('id')
            const db = c.env.DB
            const result = await db.prepare('SELECT * FROM orders WHERE id = ?').bind(id).first()

            if (!result) return c.json({ success: false, error: 'Order not found' }, 404)

            return c.json({ success: true, data: result })
        } catch (error) {
            return c.json({ success: false, error: 'Failed to fetch order' }, 500)
        }
    })

    router.put('/:id/status', async (c) => {
        try {
            const id = c.req.param('id')
            const { status } = await c.req.json()

            const db = c.env.DB
            const now = Math.floor(Date.now() / 1000)

            await db.prepare('UPDATE orders SET status = ?, updated_at = ? WHERE id = ?').bind(status, now, id).run()

            const result = await db.prepare('SELECT * FROM orders WHERE id = ?').bind(id).first()

            return c.json({ success: true, data: result })
        } catch (error) {
            return c.json({ success: false, error: 'Failed to update order' }, 400)
        }
    })

    return router
}
