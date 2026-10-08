import { renderTokenPanel } from './token-panel.js';
import { state } from './core/state.js';



  export var handle      = document.getElementById('comp-resize-handle');
  export var rightPanel  = document.getElementById('comp-doc-right');
  export var tokensPanel = document.getElementById('comp-tokens-panel');
  export var tokensBtn   = document.getElementById('comp-tab-btn-tokens');
  export var tokensClose = document.getElementById('comp-tokens-close');

  export var TOKEN_DEFAULT_WIDTH = 320;   /* default tokens panel width in px */
  export var USAGE_WIDTH         = 400;   /* right panel width when Usage tab is active */
  export var MIN_COMBINED_WIDTH  = 600;   /* min total width when tokens panel is open */
  export var DEFAULT_BASE_WIDTH  = rightPanel.offsetWidth;  /* default main column width (reset on close) */
  export var baseWidth    = DEFAULT_BASE_WIDTH;  /* main column target width */
  export var tokensWidth  = 0;                  /* tokens panel target width (0 = closed) */

  /* max right panel width = 50% of viewport, recalculated on every resize */
  export function getMaxWidth() {
    return Math.floor(window.innerWidth * 0.5);
  }

  /* ── tokens panel: open / close (animated) ──────────────────────
     Width-based animation: panel slides in/out horizontally.
     The right panel expands/contracts to match.
  ─────────────────────────────────────────────────────────────────── */
  export var closingHandler: ((e: TransitionEvent) => void) | null = null;  /* pending transitionend cleanup for close */

  export function openTokensPanel() {
    /* cancel any in-progress close animation cleanup */
    if (closingHandler) {
      tokensPanel.removeEventListener('transitionend', closingHandler);
      closingHandler = null;
    }
    tokensWidth = TOKEN_DEFAULT_WIDTH;
    /* enforce min combined width — if total would be under 640, grow tokens panel */
    var openTotal = baseWidth + tokensWidth;
    if (openTotal < MIN_COMBINED_WIDTH) {
      tokensWidth = MIN_COMBINED_WIDTH - baseWidth;
      openTotal   = MIN_COMBINED_WIDTH;
    }
    tokensPanel.classList.add('comp-tokens-panel--visible');
    tokensPanel.style.width = tokensWidth + 'px';
    tokensBtn.classList.add('comp-right-tab--active');
    tokensBtn.setAttribute('aria-selected', 'true');
    tokensBtn.setAttribute('aria-expanded', 'true');
    rightPanel.style.width = Math.min(getMaxWidth(), openTotal) + 'px';
    /* every component is spec-driven now (docs/inspect refactor complete as of 2026-08-27) — shows
       real token data immediately on open, no click-to-inspect hint step. */
    renderTokenPanel(state.status, state.size);
  }

  export function closeTokensPanel() {
    tokensWidth = 0;
    baseWidth   = DEFAULT_BASE_WIDTH;  /* reset to default width on close */
    tokensPanel.style.width = '0';
    tokensBtn.classList.remove('comp-right-tab--active');
    tokensBtn.setAttribute('aria-selected', 'false');
    tokensBtn.setAttribute('aria-expanded', 'false');
    rightPanel.style.width = baseWidth + 'px';
    /* remove --visible after the slide-out transition ends */
    closingHandler = function (e: TransitionEvent) {
      if (e.propertyName !== 'width') return;
      tokensPanel.classList.remove('comp-tokens-panel--visible');
      tokensPanel.removeEventListener('transitionend', closingHandler);
      closingHandler = null;
    };
    tokensPanel.addEventListener('transitionend', closingHandler);
  }

  if (tokensClose) {
    tokensClose.addEventListener('click', closeTokensPanel);
  }
  /* Code side panel (open/close, mutual exclusion with Tokens) removed 2026-08-26 — reverted,
     the Code snippet now lives under the preview instead (renderCodePanel targets
     #comp-preview-code-<key> and is called unconditionally, no panel to open/close). */


  /* ── resize handle ───────────────────────────────────────────────
     Drag left edge of right panel to resize.
     When tokens panel is open both panels resize proportionally.
  ─────────────────────────────────────────────────────────────────── */
  export var isDragging = false;
  export var dragStartX: number, dragStartTotal: number, dragStartMainFrac: number;
  export var dragRafPending = false;

  handle.addEventListener('mousedown', function (e) {
    isDragging      = true;
    dragStartX      = e.clientX;
    dragStartTotal  = rightPanel.offsetWidth;
    /* capture main-column fraction for proportional resize */
    dragStartMainFrac = tokensWidth > 0
      ? (dragStartTotal - tokensWidth) / dragStartTotal
      : 1;
    /* disable CSS transitions while dragging to prevent lag */
    rightPanel.classList.add('comp-doc-right--dragging');
    handle.classList.add('comp-doc-resize-handle--dragging');
    document.body.style.cursor     = 'col-resize';
    document.body.style.userSelect = 'none';
    e.preventDefault();
  });

  document.addEventListener('mousemove', function (e) {
    if (!isDragging) return;
    var dx       = dragStartX - e.clientX;    /* drag left → wider */
    var minTotal = tokensWidth > 0 ? MIN_COMBINED_WIDTH : 300;
    var newTotal = Math.max(minTotal, Math.min(getMaxWidth(), dragStartTotal + dx));

    if (tokensWidth > 0) {
      /* only tokens panel grows/shrinks — base column stays fixed */
      var newTokens = Math.max(200, newTotal - baseWidth);
      tokensWidth  = newTokens;
      tokensPanel.style.width = newTokens + 'px';
    } else {
      baseWidth = newTotal;
    }
    rightPanel.style.width = newTotal + 'px';

    /* keep toggle-group indicator in sync during drag (throttled to one RAF) */
    if (!dragRafPending) {
      dragRafPending = true;
      requestAnimationFrame(function () {
        dragRafPending = false;
        window.dispatchEvent(new Event('resize'));
      });
    }
  });

  document.addEventListener('mouseup', function () {
    if (!isDragging) return;
    isDragging = false;
    rightPanel.classList.remove('comp-doc-right--dragging');
    handle.classList.remove('comp-doc-resize-handle--dragging');
    document.body.style.cursor     = '';
    document.body.style.userSelect = '';
    /* recalculate toggle-group indicator now that drag is complete */
    window.dispatchEvent(new Event('resize'));
  });


  /* ── tab switching ───────────────────────────────────────────────
     Rules:
     - Tokens panel can only coexist with the Variants tab.
     - Opening tokens panel → always switches to Variants first.
     - Clicking Usage while tokens panel is open → closes tokens panel.
     - Usage tab is always a single-panel view (no tokens panel alongside).
  ─────────────────────────────────────────────────────────────────── */
  export var tabBtns       = document.querySelectorAll<HTMLElement>('.comp-right-tab[data-tab]');
  export var contentPanels = document.querySelectorAll<HTMLElement>('#comp-tab-variants, #comp-tab-usage');

  export function switchContentTab(target: string): void {
    tabBtns.forEach(function (b) {
      if (b.dataset.tab === 'tokens') return;
      var active = b.dataset.tab === target;
      b.classList.toggle('comp-right-tab--active', active);
      b.setAttribute('aria-selected', active ? 'true' : 'false');
    });
    contentPanels.forEach(function (panel) {
      panel.hidden = (panel.id !== 'comp-tab-' + target);
    });
  }

  tabBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var target      = btn.dataset.tab;
      var tokensOpen  = tokensPanel.classList.contains('comp-tokens-panel--visible');

      if (target === 'tokens') {
        if (tokensOpen) {
          closeTokensPanel();
        } else {
          /* tokens panel requires Variants to be visible — reset base to default first */
          baseWidth = DEFAULT_BASE_WIDTH;
          switchContentTab('variants');
          openTokensPanel();
        }
        return;
      }

      if (target === 'usage') {
        if (tokensOpen) closeTokensPanel();
        baseWidth = USAGE_WIDTH;
        rightPanel.style.width = USAGE_WIDTH + 'px';
      } else if (target === 'variants') {
        if (tokensOpen) {
          /* inspect cannot be open without variants — close it and go back to default */
          closeTokensPanel();
        } else {
          baseWidth = DEFAULT_BASE_WIDTH;
          rightPanel.style.width = DEFAULT_BASE_WIDTH + 'px';
        }
      }

      switchContentTab(target);
    });
  });


  /* ── enforce 50% max on viewport resize ─────────────────────────
     If the window shrinks below the current panel width × 2, clamp it.
  ─────────────────────────────────────────────────────────────────── */
  window.addEventListener('resize', function () {
    var max   = getMaxWidth();
    var total = baseWidth + tokensWidth;
    if (total > max) {
      /* clamp to 50% — stay above min combined if tokens are open */
      var clamped = Math.max(tokensWidth > 0 ? MIN_COMBINED_WIDTH : 240, max);
      var ratio   = baseWidth / total;
      baseWidth   = Math.round(clamped * ratio);
      tokensWidth = clamped - baseWidth;
      rightPanel.style.width = clamped + 'px';
      if (tokensWidth > 0) {
        tokensPanel.style.width = tokensWidth + 'px';
      }
    }
  }, { passive: true });