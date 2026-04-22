/* ==========================================================================
   PAYMENTS GUARD — the mock must never grant premium content in production
   --------------------------------------------------------------------------
   WHY THIS EXISTS
   payments.js ships a mock provider that resolves { success: true } after
   300ms — intentional, so the UI works in development. revenuecat-bridge.js
   wraps payments.purchase when a RevenueCat key + SDK are present, and when
   they are NOT present it silently leaves the mock in charge.

   That combination is a ship-day trap: if a real user opens the live game
   and RevenueCat failed to initialize (key missing, SDK script failed to
   load, native bridge not wired), EVERY "Unlock" tap returns the content
   free. This file closes that door.

   HOW IT WORKS
   1. On boot, detect if we are in a production context.
      Production = hostname is NOT a localhost/127.0.0.1/file:// dev address.
      A hard override is available via window.PP_PRODUCTION = true (or false).
   2. After a short delay (so revenuecat-bridge.js has had a chance to wrap
      payments.purchase), decide who is in charge:
         - If revenuecat-bridge flipped the wrapper on (window.MSRevenueCat
           reports isActive() true), we are safe — do nothing.
         - Otherwise, if production: replace payments.purchase with a
           guard that returns { success: false, error: 'payments_unavailable' }.
         - If not production: leave the mock alone so dev keeps working.
   3. Also wrap payments.isPurchased: in production with no bridge, the
      cached _purchases object may contain mock entries from earlier test
      runs. We do NOT trust them as proof of entitlement; the guard returns
      false unless a receipt has been verified by the bridge.

   Additive — no edits to payments.js or revenuecat-bridge.js.

   OVERRIDES
      window.PP_PRODUCTION = true   // force guard on
      window.PP_PRODUCTION = false  // force guard off (preview/staging web)
      localStorage.pp_dev_payments = '1'  // per-device dev opt-in
   ========================================================================== */

(function () {
    'use strict';

    const DEV_HOSTS = ['localhost', '127.0.0.1', '0.0.0.0', ''];
    const PREVIEW_HOST_RE = /(^|\.)preview\.|(^|\.)staging\.|claude\.ai$/i;

    function isDevHost() {
        try {
            const h = (location.hostname || '').toLowerCase();
            if (DEV_HOSTS.indexOf(h) !== -1) return true;
            if (location.protocol === 'file:') return true;
            if (PREVIEW_HOST_RE.test(h)) return true;
            return false;
        } catch (_) { return true; /* fail-open in dev */ }
    }

    function devOptIn() {
        try { return localStorage.getItem('pp_dev_payments') === '1'; } catch (_) { return false; }
    }

    function isProduction() {
        if (typeof window.PP_PRODUCTION === 'boolean') return window.PP_PRODUCTION;
        if (devOptIn()) return false; // per-device dev escape hatch
        return !isDevHost();
    }

    function bridgeIsActive() {
        try {
            return !!(window.MSRevenueCat && typeof window.MSRevenueCat.isActive === 'function'
                      && window.MSRevenueCat.isActive());
        } catch (_) { return false; }
    }

    function installGuard() {
        if (!window.payments || typeof window.payments.purchase !== 'function') return false;

        // Wrap purchase — block mock unlocks in production.
        const originalPurchase = window.payments.purchase.bind(window.payments);
        window.payments.purchase = async function (productId) {
            // Last-second check: maybe the bridge came online just now.
            if (bridgeIsActive()) return originalPurchase(productId);
            console.warn('[payments-guard] purchase blocked: RevenueCat bridge is not active in production.');
            showUnavailableNotice();
            return { success: false, error: 'payments_unavailable' };
        };

        // Wrap isPurchased — don't trust cached mock unlocks.
        const originalIsPurchased = window.payments.isPurchased.bind(window.payments);
        window.payments.isPurchased = function (productId) {
            // If the bridge is active, trust its cache (the bridge populates
            // _purchases only on verified receipts).
            if (bridgeIsActive()) return originalIsPurchased(productId);
            // Otherwise, in production: ignore the cache entirely. Users
            // must not retain entitlements that came from the mock.
            return false;
        };

        return true;
    }

    // A small, once-per-session toast so the user isn't confused by a silent
    // tap. We do NOT surface error text that blames the engineer.
    let noticeShown = false;
    function showUnavailableNotice() {
        if (noticeShown) return;
        noticeShown = true;

        const el = document.createElement('div');
        el.id = 'pg-notice';
        el.textContent = 'Premium unlocks are being prepared for launch. Please check back soon.';
        el.style.cssText = [
            'position:fixed', 'bottom:72px', 'left:50%',
            'transform:translateX(-50%) translateY(12px)',
            'max-width:86vw', 'padding:12px 18px',
            'font-family:inherit', 'font-size:13px',
            'color:#fff4ff',
            'background:linear-gradient(180deg, rgba(30,12,50,0.92), rgba(50,18,70,0.86))',
            'border:1px solid rgba(220, 170, 240, 0.45)',
            'border-radius:12px',
            'box-shadow:0 8px 22px rgba(0,0,0,0.5)',
            'text-align:center',
            'opacity:0',
            'z-index:9200',
            'transition:opacity 380ms ease, transform 380ms ease',
            'pointer-events:none'
        ].join(';');
        document.body.appendChild(el);
        // eslint-disable-next-line no-unused-expressions
        el.offsetHeight;
        el.style.opacity = '1';
        el.style.transform = 'translateX(-50%) translateY(0)';
        setTimeout(() => {
            el.style.opacity = '0';
            setTimeout(() => { if (el.parentNode) el.parentNode.removeChild(el); }, 420);
            noticeShown = false;
        }, 3600);
    }

    function boot() {
        if (!isProduction()) {
            // Dev / preview: leave mock in charge.
            window.PPPaymentsGuard = { active: false, reason: 'dev' };
            return;
        }
        // Give revenuecat-bridge.js (which runs on a 50ms setTimeout) a
        // chance to go first.
        setTimeout(() => {
            if (bridgeIsActive()) {
                window.PPPaymentsGuard = { active: false, reason: 'bridge-active' };
                return;
            }
            const ok = installGuard();
            window.PPPaymentsGuard = { active: ok, reason: ok ? 'mock-blocked' : 'no-payments-object' };
            if (ok) console.info('[payments-guard] Active — mock purchases blocked in production.');
        }, 250);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot, { once: true });
    } else {
        boot();
    }
})();
