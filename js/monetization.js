/* monetization.js — post-ending bundle prompts + viral share hooks.
 *
 * SAFETY CONTRACT:
 *  - Purely additive. No edits to game.js or payments.js.
 *  - Feature-flagged on pp_main_story_enabled. Off by default.
 *  - Uses window.payments.purchase() if present (mock RevenueCat stub in
 *    payments.js). Falls back to a thank-you message if not.
 *  - All keys prefixed `pp_mon_`. No mutation of game state.
 *  - Non-blocking UI: chips appear briefly after a pp:ending-seen moment or
 *    pp:quest-complete, auto-dismiss in 9s, tap to ignore — no forced flows.
 *
 * WHAT IT DOES:
 *  - Watches for a new ending-seen event (polls `pp_ending_seen_*` keys).
 *  - When one just-appeared, shows a small chip at the bottom of the screen
 *    with two actions:
 *      [ Share this memory ]   [ Collector's Bundle ]
 *  - Share: uses Web Share API (mobile) or clipboard fallback with pre-filled
 *    text referencing the character + ending name.
 *  - Collector's Bundle: opens a modal describing the pack, with a "Unlock"
 *    button that calls payments.purchase('collector_bundle') if available,
 *    otherwise marks it unlocked locally so you can test the flow.
 *  - Post-quest hooks (day 7 success) also surface a character-specific
 *    "Chapter Bundle" offer.
 */
(function () {
  'use strict';

  const FLAG_KEY = 'pp_main_story_enabled';
  const POLL_MS = 2500;

  const CHARACTER_PRETTY = {
    alistair: 'Alistair', elian: 'Elian', lyra: 'Lyra',
    caspian: 'Caspian', lucien: 'Lucien', noir: 'Noir', proto: 'Proto'
  };

  const BUNDLES = {
    collector: {
      id: 'collector_bundle',
      name: 'Collector\u2019s Memory Pack',
      price: '$9.99',
      items: [
        'All current premium memory cards',
        'Endings gallery \u2014 replay any you\u2019ve unlocked',
        '2 bonus alternate-ending variants',
        'Cloud save across devices'
      ]
    },
    chapter: (charId) => ({
      id: 'chapter_' + charId,
      name: CHARACTER_PRETTY[charId] + '\u2019s Chapter Bundle',
      price: '$4.99',
      items: [
        'Premium memory card for ' + CHARACTER_PRETTY[charId],
        '3 additional date scenes',
        'Exclusive outfit + idle pose set',
        'Bonus ending variant'
      ]
    })
  };

  // ---------------------------------------------------------------
  function isEnabled() {
    try { return localStorage.getItem(FLAG_KEY) === '1'; } catch (e) { return false; }
  }
  function seenBundleKey(id) { return 'pp_mon_bundle_prompted_' + id; }
  function purchasedKey(id)  { return 'pp_mon_bundle_purchased_' + id; }

  function getSeenEndings() {
    const out = {};
    try {
      for (const k of Object.keys(localStorage)) {
        if (k.startsWith('pp_ending_seen_')) out[k.slice('pp_ending_seen_'.length)] = localStorage.getItem(k);
      }
    } catch (e) {}
    return out;
  }

  // ---------------------------------------------------------------
  // CHIP — a small floating action prompt after a memorable moment.
  function showChip(opts) {
    // opts: { text, actions: [{label, onClick}], ttlMs }
    // Close any existing chip
    const prev = document.getElementById('mon-chip');
    if (prev) prev.remove();

    const root = document.createElement('div');
    root.id = 'mon-chip';
    root.style.cssText = [
      'position:fixed', 'left:50%', 'bottom:18%', 'transform:translateX(-50%) translateY(12px)',
      'max-width:92%', 'background:rgba(14,8,24,0.92)', 'color:#f4e6ff',
      'padding:12px 16px 14px', 'border-radius:18px',
      'box-shadow:0 8px 30px rgba(0,0,0,0.55)', 'backdrop-filter:blur(8px)',
      'display:flex', 'flex-direction:column', 'gap:10px',
      'z-index:10500', 'opacity:0', 'transition:opacity 360ms ease, transform 360ms ease',
      'font-size:13px', 'line-height:1.4', 'text-align:center'
    ].join(';');

    const text = document.createElement('div');
    text.textContent = opts.text;
    text.style.cssText = 'opacity:0.9;font-style:italic;';
    root.appendChild(text);

    const row = document.createElement('div');
    row.style.cssText = 'display:flex;gap:8px;justify-content:center;flex-wrap:wrap;';
    (opts.actions || []).forEach((act, i) => {
      const btn = document.createElement('button');
      btn.textContent = act.label;
      const primary = i === 0;
      btn.style.cssText = [
        'padding:9px 16px', 'border-radius:18px', 'border:0',
        'font-size:13px', 'font-weight:600', 'cursor:pointer', 'font-family:inherit',
        primary
          ? 'background:linear-gradient(180deg,#f6a5c0,#e879a2);color:#22112a;box-shadow:0 4px 10px rgba(232,121,162,0.35);'
          : 'background:rgba(255,255,255,0.08);color:#f4e6ff;'
      ].join(';');
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeChip();
        try { act.onClick && act.onClick(); } catch (_) {}
      });
      row.appendChild(btn);
    });

    const dismiss = document.createElement('div');
    dismiss.textContent = 'not now';
    dismiss.style.cssText = 'font-size:11px;opacity:0.45;cursor:pointer;margin-top:2px;';
    dismiss.addEventListener('click', closeChip);
    root.appendChild(row);
    root.appendChild(dismiss);

    document.body.appendChild(root);
    requestAnimationFrame(() => {
      root.style.opacity = '1';
      root.style.transform = 'translateX(-50%) translateY(0)';
    });

    let ttl = opts.ttlMs || 11000;
    const timer = setTimeout(closeChip, ttl);

    function closeChip() {
      clearTimeout(timer);
      root.style.opacity = '0';
      root.style.transform = 'translateX(-50%) translateY(12px)';
      setTimeout(() => { try { root.remove(); } catch (_) {} }, 400);
    }
  }

  // ---------------------------------------------------------------
  // BUNDLE MODAL
  function showBundleModal(bundle, onClose) {
    const back = document.createElement('div');
    back.id = 'mon-bundle-back';
    back.style.cssText = [
      'position:fixed', 'inset:0', 'background:rgba(5,3,12,0.72)',
      'z-index:10600', 'display:flex', 'align-items:center', 'justify-content:center',
      'opacity:0', 'transition:opacity 320ms ease', 'backdrop-filter:blur(4px)'
    ].join(';');

    const modal = document.createElement('div');
    modal.style.cssText = [
      'max-width:92%', 'width:340px', 'background:linear-gradient(180deg,#1a102a,#120820)',
      'color:#f4e6ff', 'padding:22px 22px 18px', 'border-radius:22px',
      'box-shadow:0 20px 60px rgba(0,0,0,0.7)',
      'transform:scale(0.96)', 'transition:transform 340ms cubic-bezier(.2,.8,.2,1)'
    ].join(';');

    const banner = document.createElement('div');
    banner.textContent = 'MEMORY BUNDLE';
    banner.style.cssText = 'font-size:11px;letter-spacing:3px;opacity:0.6;margin-bottom:6px;text-align:center;';
    modal.appendChild(banner);

    const title = document.createElement('div');
    title.textContent = bundle.name;
    title.style.cssText = 'font-size:20px;font-weight:700;text-align:center;margin-bottom:14px;';
    modal.appendChild(title);

    const list = document.createElement('ul');
    list.style.cssText = 'list-style:none;padding:0;margin:0 0 18px;display:flex;flex-direction:column;gap:8px;';
    bundle.items.forEach((itm) => {
      const li = document.createElement('li');
      li.style.cssText = 'font-size:14px;opacity:0.92;padding-left:20px;position:relative;line-height:1.4;';
      li.innerHTML = '<span style="position:absolute;left:0;top:2px;color:#f6a5c0;">\u2726</span>' + itm;
      list.appendChild(li);
    });
    modal.appendChild(list);

    const priceRow = document.createElement('div');
    priceRow.style.cssText = 'display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;';
    const priceLabel = document.createElement('div');
    priceLabel.innerHTML = '<span style="opacity:0.6;font-size:12px;">one-time</span><br><span style="font-size:22px;font-weight:700;">' + bundle.price + '</span>';
    priceRow.appendChild(priceLabel);
    modal.appendChild(priceRow);

    const unlockBtn = document.createElement('button');
    unlockBtn.textContent = 'Unlock';
    unlockBtn.style.cssText = [
      'width:100%', 'padding:14px', 'border-radius:16px', 'border:0',
      'background:linear-gradient(180deg,#f6a5c0,#e879a2)',
      'color:#22112a', 'font-size:16px', 'font-weight:700', 'font-family:inherit',
      'box-shadow:0 6px 18px rgba(232,121,162,0.4)', 'cursor:pointer'
    ].join(';');
    unlockBtn.addEventListener('click', () => {
      unlockBtn.disabled = true;
      unlockBtn.textContent = 'Processing\u2026';
      const done = (ok) => {
        unlockBtn.textContent = ok ? '\u2728 Unlocked' : 'Try Again';
        unlockBtn.style.background = ok ? 'linear-gradient(180deg,#c5ffd8,#64d98a)' : unlockBtn.style.background;
        unlockBtn.disabled = false;
        if (ok) {
          try { localStorage.setItem(purchasedKey(bundle.id), '1'); } catch (_) {}
          setTimeout(close, 1200);
        }
      };
      try {
        if (window.payments && typeof window.payments.purchase === 'function') {
          Promise.resolve(window.payments.purchase(bundle.id)).then(() => done(true)).catch(() => done(false));
        } else {
          setTimeout(() => done(true), 450);
        }
      } catch (e) { done(false); }
    });
    modal.appendChild(unlockBtn);

    const closeRow = document.createElement('div');
    closeRow.textContent = 'maybe later';
    closeRow.style.cssText = 'text-align:center;margin-top:10px;font-size:12px;opacity:0.5;cursor:pointer;';
    closeRow.addEventListener('click', close);
    modal.appendChild(closeRow);

    back.appendChild(modal);
    document.body.appendChild(back);
    requestAnimationFrame(() => {
      back.style.opacity = '1';
      modal.style.transform = 'scale(1)';
    });

    function close() {
      back.style.opacity = '0';
      modal.style.transform = 'scale(0.96)';
      setTimeout(() => {
        try { back.remove(); } catch (_) {}
        if (onClose) try { onClose(); } catch (_) {}
      }, 300);
    }
  }

  // ---------------------------------------------------------------
  // SHARE — Web Share API with clipboard fallback.
  function shareMemory(charId, endingBranch) {
    const name = CHARACTER_PRETTY[charId] || charId;
    const branchText = endingBranch === 'good' ? 'a quiet ending' :
                       endingBranch === 'dark' ? 'a dark ending' :
                       'an ending';
    const text =
      `I reached ${branchText} with ${name} in Pocket Paramour. 7 characters, each one remembers every choice. \u2764`;

    const shareData = {
      title: 'Pocket Paramour',
      text,
      url: window.location.origin || ''
    };
    const done = (ok, method) => {
      showChip({
        text: ok ? 'Shared. Thank you \u2728' : ('Copied to clipboard (' + method + ')'),
        actions: [],
        ttlMs: 3800
      });
    };
    try {
      if (navigator.share) {
        navigator.share(shareData).then(() => done(true, 'native')).catch(() => { copyFallback(text); });
      } else {
        copyFallback(text);
      }
    } catch (e) { copyFallback(text); }

    function copyFallback(t) {
      try {
        navigator.clipboard.writeText(t + ' ' + (shareData.url || '')).then(
          () => done(false, 'clipboard'),
          () => done(false, 'manual')
        );
      } catch (_) { done(false, 'manual'); }
    }
  }

  // ---------------------------------------------------------------
  // Post-ending prompt
  function offerEndingExtras(charId) {
    const branch = localStorage.getItem('pp_ending_branch_' + charId);
    const name = CHARACTER_PRETTY[charId] || charId;
    showChip({
      text: 'That\u2019s your ending with ' + name + '.',
      actions: [
        {
          label: 'Share this memory',
          onClick: () => shareMemory(charId, branch)
        },
        {
          label: 'Collector\u2019s Bundle',
          onClick: () => showBundleModal(BUNDLES.collector)
        }
      ]
    });
  }

  function offerChapterBundle(charId) {
    const b = BUNDLES.chapter(charId);
    if (localStorage.getItem(seenBundleKey(b.id)) === '1') return;
    try { localStorage.setItem(seenBundleKey(b.id), '1'); } catch (_) {}
    showChip({
      text: 'You\u2019ve reached the end of the week with ' + (CHARACTER_PRETTY[charId] || charId) + '.',
      actions: [
        { label: 'See ' + CHARACTER_PRETTY[charId] + '\u2019s Bundle', onClick: () => showBundleModal(b) }
      ]
    });
  }

  // ---------------------------------------------------------------
  // WATCHERS
  let _lastEndingsSeen = {};
  function endingsTick() {
    if (!isEnabled()) return;
    const now = getSeenEndings();
    // Detect a *new* ending seen since last poll (and not this module's own prompt)
    for (const c of Object.keys(now)) {
      if (!_lastEndingsSeen[c] && now[c] === '1') {
        // Slight delay so the ending card's own fade-out finishes first
        setTimeout(() => offerEndingExtras(c), 900);
      }
    }
    _lastEndingsSeen = now;
  }

  // Wait until no premium card overlay is on-screen, then run the callback.
  // Prevents the chip from being hidden behind an auto-triggered card.
  function waitForCardToFinish(cb, giveUpAfterMs) {
    const deadline = Date.now() + (giveUpAfterMs || 20000);
    const tick = () => {
      if (!document.getElementById('mscard-root')) { cb(); return; }
      if (Date.now() > deadline) { cb(); return; }
      setTimeout(tick, 400);
    };
    tick();
  }

  function onQuestComplete(e) {
    if (!isEnabled()) return;
    const d = e && e.detail;
    if (!d) return;
    if (d.questId === 'd7' && d.charId && CHARACTER_PRETTY[d.charId]) {
      // Day 7 done. cards-library may trigger a premium card from the same
      // event (it has a ~1.8s show-delay). Give the card time to appear,
      // then wait for it to finish before surfacing the bundle chip so the
      // chip never gets covered.
      setTimeout(() => {
        waitForCardToFinish(() => offerChapterBundle(d.charId));
      }, 3000);
    }
  }

  function boot() {
    if (!isEnabled()) return;
    try {
      _lastEndingsSeen = getSeenEndings();
      setInterval(endingsTick, POLL_MS);
      document.addEventListener('pp:quest-complete', onQuestComplete);
    } catch (e) {
      console.warn('[monetization] disabled due to error:', e);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  // Debug hooks
  window.MSMonetization = {
    isEnabled,
    offerEndingExtras,
    offerChapterBundle,
    shareMemory,
    showBundleModal,
    bundles: BUNDLES,
    _debug_reset: () => {
      try {
        Object.keys(localStorage)
          .filter(k => k.startsWith('pp_mon_'))
          .forEach(k => localStorage.removeItem(k));
      } catch (_) {}
    }
  };
})();
