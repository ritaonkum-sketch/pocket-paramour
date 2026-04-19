// Payment Abstraction Layer
// Wraps RevenueCat (eventual) or mock provider for premium content

class PaymentSystem {
    constructor() {
        this.provider = 'mock'; // 'mock' | 'revenuecat'
        this.initialized = false;
        this._purchases = {}; // { productId: true }
    }

    async init() {
        if (this.initialized) return;

        // Check if RevenueCat SDK is loaded
        if (typeof Purchases !== 'undefined') {
            try {
                // RevenueCat Web SDK initialization
                // Replace with your actual API key when ready
                // await Purchases.configure({ apiKey: 'YOUR_REVENUECAT_API_KEY' });
                // this.provider = 'revenuecat';
                console.log('[Payments] RevenueCat SDK detected but not configured');
            } catch (e) {
                console.warn('[Payments] RevenueCat init failed, using mock:', e);
            }
        }

        // Load cached purchases from localStorage
        try {
            const cached = localStorage.getItem('pp_purchases');
            if (cached) this._purchases = JSON.parse(cached);
        } catch (e) {}

        this.initialized = true;
    }

    // Purchase a premium scene/content
    async purchase(productId) {
        if (!this.initialized) await this.init();

        if (this.provider === 'revenuecat') {
            // Real purchase flow via RevenueCat
            // try {
            //     const { customerInfo } = await Purchases.purchaseProduct(productId);
            //     if (customerInfo.entitlements.active[productId]) {
            //         this._purchases[productId] = true;
            //         this._savePurchases();
            //         return { success: true };
            //     }
            // } catch (e) {
            //     return { success: false, error: e.message };
            // }
            return { success: false, error: 'RevenueCat not configured' };
        }

        // Mock provider — simulates a purchase (free for development)
        return new Promise(resolve => {
            // Simulate a brief loading state
            setTimeout(() => {
                this._purchases[productId] = true;
                this._savePurchases();
                resolve({ success: true });
            }, 300);
        });
    }

    // Check if a product has been purchased
    isPurchased(productId) {
        return !!this._purchases[productId];
    }

    // Restore purchases (useful after reinstall)
    async restorePurchases() {
        if (this.provider === 'revenuecat') {
            // try {
            //     const { customerInfo } = await Purchases.restorePurchases();
            //     // Sync entitlements to local cache
            //     for (const id of Object.keys(customerInfo.entitlements.active)) {
            //         this._purchases[id] = true;
            //     }
            //     this._savePurchases();
            //     return { success: true, count: Object.keys(this._purchases).length };
            // } catch (e) {
            //     return { success: false, error: e.message };
            // }
        }
        return { success: true, count: Object.keys(this._purchases).length };
    }

    _savePurchases() {
        try {
            localStorage.setItem('pp_purchases', JSON.stringify(this._purchases));
        } catch (e) {}
    }
}

// Singleton
const payments = new PaymentSystem();
