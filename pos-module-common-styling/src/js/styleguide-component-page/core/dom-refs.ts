

  /* ── per-component configuration ────────────────────────────────
     COMP_CONFIGS maps each component key (matching data-comp-key on
     sections) to its name, which controls to show, usage text, and
     state→token map for the tokens panel.
  ─────────────────────────────────────────────────────────────────── */
  export var tokenFormat    = document.getElementById('comp-tokens-format') as HTMLSelectElement | null;
  export var tokenPanelBody = document.getElementById('comp-tokens-panel-body');
  export var usageContainer = document.getElementById('comp-right-usage');
  export var rightTitle     = document.getElementById('comp-right-title');
  export var mainContent    = document.getElementById('main-content');

  /* self-check: #main-content must exist and be scrollable — if missing,
     section-scroll will silently fail (window/body are overflow:hidden on this page) */
  (function() {
    if (!mainContent) {
      console.error('[styleguide] #main-content not found — section scroll will not work.');
      return;
    }
    var ov = getComputedStyle(mainContent).overflowY;
    if (ov !== 'scroll' && ov !== 'auto') {
      console.error('[styleguide] #main-content overflow-y is "' + ov + '" — expected scroll or auto. Section anchors will not scroll correctly.');
    }
  })();