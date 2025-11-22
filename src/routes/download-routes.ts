import { Hono } from 'hono'

export function createDownloadRoutes(): Hono {
    const router = new Hono()

    router.get('/:token', async (c) => {
        try {
            const token = c.req.param('token')
            const db = c.env.DB

            const result = await db
                .prepare('SELECT * FROM download_links WHERE token = ? AND (expires_at IS NULL OR expires_at > ?)')
                .bind(token, Math.floor(Date.now() / 1000))
                .first()

            if (!result) {
                return c.json({ success: false, error: 'Download link not found or expired' }, 404)
            }

            // Check download limit
            if (result.max_downloads && result.download_count >= result.max_downloads) {
                return c.json({ success: false, error: 'Download limit exceeded' }, 403)
            }

            // Increment download count
            await db
                .prepare('UPDATE download_links SET download_count = download_count + 1, last_accessed_at = ? WHERE id = ?')
                .bind(Math.floor(Date.now() / 1000), result.id)
                .run()

            return c.json({ success: true, message: 'Download initiated' })
        } catch (error) {
            return c.json({ success: false, error: 'Failed to process download' }, 500)
        }
    })

    router.get('/:token/info', async (c) => {
        try {
            const token = c.req.param('token')
            const db = c.env.DB

            const result = await db.prepare('SELECT * FROM download_links WHERE token = ?').bind(token).first()

            if (!result) {
                return c.json({ success: false, error: 'Download link not found' }, 404)
            }

            return c.json({
                success: true,
                data: {
                    token,
                    downloadCount: result.download_count,
                    maxDownloads: result.max_downloads,
                    expiresAt: result.expires_at,
                    lastAccessedAt: result.last_accessed_at,
                },
            })
        } catch (error) {
            return c.json({ success: false, error: 'Failed to fetch download info' }, 500)
        }
    })

    return router
}
