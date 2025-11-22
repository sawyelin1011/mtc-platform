/**
 * Payment Lifecycle Hooks
 */

export function registerPaymentHooks() {
    return [
        {
            name: 'payment:before:process',
            handler: async (payment: any, context: any) => {
                context.logger.info('Payment processing initiated', { paymentId: payment.id })
                return payment
            },
        },
        {
            name: 'payment:after:process',
            handler: async (payment: any, context: any) => {
                context.logger.info('Payment processed successfully', { paymentId: payment.id })
                // Could generate download links for digital products, etc.
                return payment
            },
        },
    ]
}
