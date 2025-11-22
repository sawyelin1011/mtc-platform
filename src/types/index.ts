/**
 * E-Commerce Plugin Types
 */

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

export interface Product {
    id: string
    storeId: string
    name: string
    slug: string
    description?: string
    type: 'physical' | 'digital'
    sku: string
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
    sku: string
    price?: number
    stockQuantity: number
    imageUrl?: string
    metadata?: Record<string, any>
    createdAt: number
}

export interface Order {
    id: string
    storeId: string
    orderNumber: string
    userId?: string
    email: string
    status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
    paymentStatus: 'unpaid' | 'paid' | 'refunded' | 'failed'
    shippingStatus: 'unshipped' | 'shipped' | 'delivered' | 'returned'
    subtotal: number
    tax: number
    shipping: number
    discount: number
    total: number
    currency: string
    paymentMethod?: string
    paymentId?: string
    shippingAddress?: Record<string, any>
    billingAddress?: Record<string, any>
    notes?: string
    metadata?: Record<string, any>
    createdAt: number
    updatedAt: number
}

export interface OrderItem {
    id: string
    orderId: string
    productId: string
    variantId?: string
    productName: string
    quantity: number
    price: number
    total: number
    createdAt: number
}

export interface Payment {
    id: string
    orderId: string
    paymentMethodId: string
    amount: number
    currency: string
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded'
    transactionId?: string
    errorMessage?: string
    metadata?: Record<string, any>
    createdAt: number
    updatedAt: number
}

export interface DigitalDownload {
    id: string
    productId: string
    fileName: string
    filePath: string
    fileSize?: number
    mimeType: string
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

export interface Coupon {
    id: string
    storeId: string
    code: string
    description?: string
    discountType: 'percentage' | 'fixed'
    discountValue: number
    maxUses?: number
    currentUses: number
    minPurchaseAmount?: number
    validFrom?: number
    validUntil?: number
    isActive: boolean
    createdAt: number
}

export interface ShippingMethod {
    id: string
    storeId: string
    name: string
    description?: string
    baseCost: number
    costPerKg?: number
    minWeight?: number
    maxWeight?: number
    minPrice?: number
    maxPrice?: number
    isActive: boolean
    createdAt: number
}

export interface PaymentMethod {
    id: string
    storeId: string
    name: string
    type: 'stripe' | 'paypal' | 'square' | 'custom'
    isActive: boolean
    config?: Record<string, any>
    createdAt: number
}

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
