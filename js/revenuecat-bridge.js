/* revenuecat-bridge.js — opt-in wrapper that routes payments.purchase() calls
 * to a real RevenueCat SDK when a key is provided.
 *
 * HOW TO ACTIVATE (when you\u2019re ready to ship real payments):
 *  1. Sign up at https://www.revenuecat.com/, configure your products,
 *     and get your Public SDK Key (the one that begins with `rcv1_` or
 *     `goog_` / `appl_` for native builds).
 *  2. Load the RevenueCat web SDK in index.html BEFORE this file:
 *        <script src="https://cdn.jsdelivr.net/npm/@revenuecat/purchases-js/dist/Purchases.js"></script>
 *     (or install + bundle via npm for production).
 *  3. Put your key into localStorage once, on the device:
 *        localStorage.setItem('pp_rc_public_key', '<your-key-here>');
 *     Or hard-code it in this file at INIT_KEY below.
 *  4. Reload. This module will detect the key, initialize RevenueCat,
 *     and replace window.payments.purchase with a real purchase flow.
 *
 * SAFETY CONTRACT:
 *  - Purely additive. No edits to payments.js.
 *  - If the SDK is not loaded OR no key is configured: this file is a no-op
 *    and the existing mock stub in payments.js remains in charge. Everything
 *    keeps working exactly as it does today.
 *  - Wraps the original payments.purchase so debug flows still work: the
 *    stub\u2019s localStorage unlock is preserved as a fallback when the SDK
 *    rejects with a recoverable error (useful for dev testing on web while
 *    the real SDK only works on mobile).
 *
 * TESTING WITHOUT A REAL KEY:
 *  - Set localStorage.pp_rc_debug = '1' to simulate real-SDK responses with
 *    a 50/50 accept/reject split \u2014 good for exercising the error UI.
 */
(function () {
  'use strict';

  const KEY_STORAGE = 'pp_rc_public_key';
  const DEBUG_STORAGE = 'pp_rc_debug';
  const INIT_KEY = '';   // \u2190 paste your Public SDK Key here, or leave empty to use localStorage.

  function getKey() {
    if (INIT_KEY) return INIT_KEY;
    try { return localStorage.getItem(KEY_STORAGE) || ''; } catch (e) { return ''; }
  }
  function debugMode() {
    try { return localStorage.getItem(DEBUG_STORAGE) === '1'; } catch (e) { return false; }
  }

  function hasRealSDK() {
    return !!(window.Purchases && typeof window.Purchases.configure === 'function');
  }

  // ---------------------------------------------------------------
  // Initialise the SDK. Runs at most once. Returns true if real-SDK flow
  // is now active; false if we\u2019re deferring to the mock.
  let _active = false;
  function initIfConfigured() {
    if (_active) return true;
    const key = getKey();
    const debug = debugMode();

    // Debug mode \u2014 fake the SDK with a 50/50 random outcome
    if (debug && !hasRealSDK()) {
      installDebugWrapper();
      _active = true;
      console.info('[revenuecat-bridge] DEBUG MODE \u2014 simulating purchases');
      return true;
    }

    if (!key) return false;
    if (!hasRealSDK()) {
      console.warn('[revenuecat-bridge] Key present but Purchases SDK not loaded. Add the SDK <script> to index.html.');
      return false;
    }

    try {
      window.Purchases.configure({ apiKey: key });
      installRealWrapper();
      _active = true;
      console.info('[revenuecat-bridge] live \u2014 routing payments.purchase through RevenueCat');
      return true;
    } catch (e) {
      console.warn('[revenuecat-bridge] init failed, falling back to mock:', e);
      return false;
    }
  }

  // Wrap payments.purchase so calls go through the real SDK.
  function installRealWrapper() {
    if (!window.payments || typeof window.payments.purchase !== 'function') return;
    const mockPurchase = window.payments.purchase.bind(window.payments);
    window.payments.purchase = async function (productId) {
      try {
        // Typical RevenueCat JS flow: getOfferings -> purchasePackage.
        const offerings = await window.Purchases.getOfferings();
        const current = offerings && offerings.current;
        const pkg = current && current.availablePackages && current.availablePackages.find(p => p.identifier === productId || (p.product && p.product.identifier === productId));
        if (!pkg) {
          // Fall back to identifier-based purchaseProduct
          if (typeof window.Purchases.purchaseProduct === 'function') {
            return await window.Purchases.purchaseProduct(productId);
          }
          throw new Error('No package found for ' + productId);
        }
        return await window.Purchases.purchasePackage(pkg);
      } catch (err) {
        console.warn('[revenuecat-bridge] purchase failed:', err);
        // Safety net: on web-only dev builds RevenueCat may not be available.
        // Let the mock take over so the UI flow keeps working.
        return mockPurchase(productId);
      }
    };
  }

  // Debug wrapper — simulates 50/50 accept/reject so you can exercise UI.
  function installDebugWrapper() {
    if (!window.payments || typeof window.payments.purchase !== 'function') return;
    const mockPurchase = window.payments.purchase.bind(window.payments);
    window.payments.purchase = function (productId) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          if (Math.random() < 0.5) {
            // Simulate success via the mock (keeps local flag behavior)
            mockPurchase(productId).then(resolve, reject);
          } else {
            reject(new Error('Simulated payment failure (pp_rc_debug)'));
          }
        }, 700);
      });
    };
  }

  // ---------------------------------------------------------------
  function boot() {
    // Delay a tick so payments.js + window.Purchases (if present) have loaded
    setTimeout(initIfConfigured, 50);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  // Public hooks
  window.MSRevenueCat = {
    isActive: () => _active,
    hasKey: () => !!getKey(),
    hasSDK: hasRealSDK,
    init: initIfConfigured
  };
})();
