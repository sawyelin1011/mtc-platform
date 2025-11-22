/**
 * Store Lifecycle Hooks
 */

export function registerStoreHooks() {
    return [
        {
            name: 'store:before:create',
            handler: async (store: any, context: any) => {
                context.logger.info('Store creation initiated', { storeId: store.id })
                return store
            },
        },
        {
            name: 'store:after:create',
            handler: async (store: any, context: any) => {
                context.logger.info('Store created successfully', { storeId: store.id })
                // Could trigger welcome email, analytics, etc.
                return store
            },
        },
    ]
}
