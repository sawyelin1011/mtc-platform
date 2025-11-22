/**
 * Digital Download Service - Secure digital product downloads
 * 
 * Manages digital downloads, access tokens, and download tracking
 */

import type { D1Database, R2Bucket } from '@cloudflare/workers-types'
import { createHash } from 'crypto'

export interface DigitalDownload {
  id: string
  productId: string
  fileName: string
  filePath: string
  fileSize?: number
  mimeType?: string
  r2Key: string
  downloadLimit?: number
  expirationDays?: number
  createdAt: number
}

export interface DownloadLink {
  id: string
  orderItemId: string
  digitalDownloadId: string
  token: string
  downloadCount: number
  maxDownloads?: number
  expiresAt?: number
  lastAccessedAt?: number
  createdAt: number
}

export interface CreateDigitalDownloadInput {
  productId: string
  fileName: string
  filePath: string
  fileSize?: number
  mimeType?: string
  downloadLimit?: number
  expirationDays?: number
}

export class DigitalDownloadService {
  constructor(
    private db: D1Database,
    private r2: R2Bucket
  ) {}

  /**
   * Create a digital download
   */
  async createDigitalDownload(input: CreateDigitalDownloadInput): Promise<DigitalDownload> {
    const id = `dl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const r2Key = `digital-downloads/${id}/${input.fileName}`
    const now = Math.floor(Date.now() / 1000)

    const download: DigitalDownload = {
      id,
      productId: input.productId,
      fileName: input.fileName,
      filePath: input.filePath,
      fileSize: input.fileSize,
      mimeType: input.mimeType,
      r2Key,
      downloadLimit: input.downloadLimit,
      expirationDays: input.expirationDays,
      createdAt: now,
    }

    await this.db
      .prepare(`
        INSERT INTO digital_downloads 
        (id, product_id, file_name, file_path, file_size, mime_type, r2_key, download_limit, expiration_days, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .bind(
        download.id,
        download.productId,
        download.fileName,
        download.filePath,
        download.fileSize || null,
        download.mimeType || null,
        download.r2Key,
        download.downloadLimit || null,
        download.expirationDays || null,
        download.createdAt
      )
      .run()

    return download
  }

  /**
   * Get digital download
   */
  async getDigitalDownload(id: string): Promise<DigitalDownload | null> {
    const result = await this.db
      .prepare('SELECT * FROM digital_downloads WHERE id = ?')
      .bind(id)
      .first()

    if (!result) return null
    return this.mapRowToDigitalDownload(result)
  }

  /**
   * Get product downloads
   */
  async getProductDownloads(productId: string): Promise<DigitalDownload[]> {
    const result = await this.db
      .prepare('SELECT * FROM digital_downloads WHERE product_id = ? ORDER BY created_at DESC')
      .bind(productId)
      .all()

    return (result.results || []).map(row => this.mapRowToDigitalDownload(row))
  }

  /**
   * Upload file to R2
   */
  async uploadFile(file: File, downloadId: string): Promise<void> {
    const download = await this.getDigitalDownload(downloadId)
    if (!download) throw new Error(`Digital download not found: ${downloadId}`)

    const buffer = await file.arrayBuffer()

    await this.r2.put(download.r2Key, buffer, {
      httpMetadata: {
        contentType: download.mimeType || 'application/octet-stream',
        contentDisposition: `attachment; filename="${download.fileName}"`,
      },
    })
  }

  /**
   * Create download link
   */
  async createDownloadLink(
    orderItemId: string,
    digitalDownloadId: string,
    maxDownloads?: number,
    expirationDays?: number
  ): Promise<DownloadLink> {
    const id = `link_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const token = this.generateToken()
    const now = Math.floor(Date.now() / 1000)
    const expiresAt = expirationDays ? now + expirationDays * 24 * 60 * 60 : undefined

    const link: DownloadLink = {
      id,
      orderItemId,
      digitalDownloadId,
      token,
      downloadCount: 0,
      maxDownloads,
      expiresAt,
      createdAt: now,
    }

    await this.db
      .prepare(`
        INSERT INTO download_links 
        (id, order_item_id, digital_download_id, token, download_count, max_downloads, expires_at, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .bind(
        link.id,
        link.orderItemId,
        link.digitalDownloadId,
        link.token,
        link.downloadCount,
        link.maxDownloads || null,
        link.expiresAt || null,
        link.createdAt
      )
      .run()

    return link
  }

  /**
   * Get download link by token
   */
  async getDownloadLinkByToken(token: string): Promise<DownloadLink | null> {
    const result = await this.db
      .prepare('SELECT * FROM download_links WHERE token = ?')
      .bind(token)
      .first()

    if (!result) return null

    const link = this.mapRowToDownloadLink(result)

    // Check if link is expired
    if (link.expiresAt && link.expiresAt < Math.floor(Date.now() / 1000)) {
      throw new Error('Download link has expired')
    }

    // Check if download limit reached
    if (link.maxDownloads && link.downloadCount >= link.maxDownloads) {
      throw new Error('Download limit reached')
    }

    return link
  }

  /**
   * Get order item download links
   */
  async getOrderItemDownloadLinks(orderItemId: string): Promise<DownloadLink[]> {
    const result = await this.db
      .prepare('SELECT * FROM download_links WHERE order_item_id = ? ORDER BY created_at DESC')
      .bind(orderItemId)
      .all()

    return (result.results || []).map(row => this.mapRowToDownloadLink(row))
  }

  /**
   * Record download
   */
  async recordDownload(linkId: string): Promise<void> {
    const now = Math.floor(Date.now() / 1000)

    await this.db
      .prepare(
        'UPDATE download_links SET download_count = download_count + 1, last_accessed_at = ? WHERE id = ?'
      )
      .bind(now, linkId)
      .run()
  }

  /**
   * Get download file
   */
  async getDownloadFile(token: string): Promise<{ file: ReadableStream<Uint8Array>; fileName: string; mimeType: string }> {
    const link = await this.getDownloadLinkByToken(token)
    if (!link) throw new Error('Invalid download link')

    const download = await this.getDigitalDownload(link.digitalDownloadId)
    if (!download) throw new Error('Digital download not found')

    // Record the download
    await this.recordDownload(link.id)

    // Get file from R2
    const object = await this.r2.get(download.r2Key)
    if (!object) throw new Error('File not found in storage')

    return {
      file: object.body as ReadableStream<Uint8Array>,
      fileName: download.fileName,
      mimeType: download.mimeType || 'application/octet-stream',
    }
  }

  /**
   * Delete digital download
   */
  async deleteDigitalDownload(id: string): Promise<void> {
    const download = await this.getDigitalDownload(id)
    if (!download) throw new Error(`Digital download not found: ${id}`)

    // Delete from R2
    await this.r2.delete(download.r2Key)

    // Delete from database
    await this.db.prepare('DELETE FROM digital_downloads WHERE id = ?').bind(id).run()
  }

  /**
   * Delete download link
   */
  async deleteDownloadLink(id: string): Promise<void> {
    await this.db.prepare('DELETE FROM download_links WHERE id = ?').bind(id).run()
  }

  /**
   * Clean up expired download links
   */
  async cleanupExpiredLinks(): Promise<void> {
    const now = Math.floor(Date.now() / 1000)

    await this.db
      .prepare('DELETE FROM download_links WHERE expires_at IS NOT NULL AND expires_at < ?')
      .bind(now)
      .run()
  }

  /**
   * Generate secure token
   */
  private generateToken(): string {
    const randomBytes = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    const timestamp = Date.now().toString(36)
    const combined = `${randomBytes}${timestamp}`

    // Create hash for additional security
    const hash = createHash('sha256').update(combined).digest('hex')
    return hash.substring(0, 32)
  }

  /**
   * Map database row to DigitalDownload
   */
  private mapRowToDigitalDownload(row: any): DigitalDownload {
    return {
      id: row.id,
      productId: row.product_id,
      fileName: row.file_name,
      filePath: row.file_path,
      fileSize: row.file_size,
      mimeType: row.mime_type,
      r2Key: row.r2_key,
      downloadLimit: row.download_limit,
      expirationDays: row.expiration_days,
      createdAt: row.created_at,
    }
  }

  /**
   * Map database row to DownloadLink
   */
  private mapRowToDownloadLink(row: any): DownloadLink {
    return {
      id: row.id,
      orderItemId: row.order_item_id,
      digitalDownloadId: row.digital_download_id,
      token: row.token,
      downloadCount: row.download_count,
      maxDownloads: row.max_downloads,
      expiresAt: row.expires_at,
      lastAccessedAt: row.last_accessed_at,
      createdAt: row.created_at,
    }
  }
}
