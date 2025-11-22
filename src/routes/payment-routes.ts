import { Hono } from 'hono'

export function createPaymentRoutes(): Hono {
    const router = new Hono()

    router.post('/process', async (c) => {
        try {
            const body = await c.req.json()
            const { orderId, amount, paymentMethod } = body

            if (!orderId || !amount || !paymentMethod) {
                return c.json({ success: false, error: 'Missing required fields' }, 400)
            }

            // Payment processing logic would go here
            // For now, just mark as processing

            const db = c.env.DB
            const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            const now = Math.floor(Date.now() / 1000)

            await db
                .prepare(`
          INSERT INTO payments (id, order_id, payment_method_id, amount, status, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `)
                .bind(paymentId, orderId, paymentMethod, amount, 'processing', now, now)
                .run()

            return c.json({ success: true, data: { paymentId, status: 'processing' } }, 201)
        } catch (error) {
            return c.json({ success: false, error: 'Payment processing failed' }, 400)
        }
    })

    router.post('/webhook/stripe', async (c) => {
        try {
            // Stripe webhook handling
            return c.json({ success: true, received: true })
        } catch (error) {
            return c.json({ success: false, error: 'Webhook processing failed' }, 400)
        }
    })

    router.post('/webhook/paypal', async (c) => {
        try {
            // PayPal webhook handling
            return c.json({ success: true, received: true })
        } catch (error) {
            return c.json({ success: false, error: 'Webhook processing failed' }, 400)
        }
    })

    router.get('/methods', async (c) => {
        try {
            const storeId = c.req.query('store_id')
            if (!storeId) return c.json({ success: false, error: 'store_id required' }, 400)

            const db = c.env.DB
            const result = await db
                .prepare('SELECT * FROM payment_methods WHERE store_id = ? AND is_active = 1')
                .bind(storeId)
                .all()

            return c.json({ success: true, data: result.results || [] })
        } catch (error) {
            return c.json({ success: false, error: 'Failed to fetch payment methods' }, 500)
        }
    })

    return router
}
