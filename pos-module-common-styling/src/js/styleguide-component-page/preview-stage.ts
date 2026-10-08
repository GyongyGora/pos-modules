import { state } from './core/state.js';




  /* ── preview: apply status to buttons ───────────────────────────
     Uses .pos-debug-button-* classes to force visual states.
  ─────────────────────────────────────────────────────────────────── */
  export var previewStage = document.getElementById('comp-preview-stage');  /* button stage (static ref) */

  export function getPreviewButtons(): NodeListOf<HTMLButtonElement> | HTMLButtonElement[] {
    var stage = getActivePreviewStage() || previewStage;
    return stage ? stage.querySelectorAll<HTMLButtonElement>('.pos-button') : [];
  }

  export function getPreviewLinks(): NodeListOf<HTMLAnchorElement> | HTMLAnchorElement[] {
    var stage = getActivePreviewStage();
    return stage ? stage.querySelectorAll<HTMLAnchorElement>('a') : [];
  }

  /* prevent preview links from navigating so they never acquire :visited state */
  document.querySelectorAll<HTMLElement>('.comp-preview-stage--link a').forEach(function (a) {
    a.addEventListener('click', function (e) { e.preventDefault(); });
  });

  /* active flash — mousedown/mouseup on preview buttons so the active state is visible on click
     (CSS :active doesn't fire when the inspect overlay intercepts events) */
  document.querySelectorAll<HTMLElement>('.comp-preview-stage').forEach(function (stage) {
    stage.addEventListener('mousedown', function (e) {
      var btn = (e.target as HTMLElement).closest<HTMLButtonElement>('.pos-button');
      if (!btn || btn.disabled || btn.getAttribute('aria-disabled') === 'true' || btn.classList.contains('pos-button--loading')) return;
      btn.classList.add('pos-debug-button-active');
      var cleanup = function () {
        btn.classList.remove('pos-debug-button-active');
        document.removeEventListener('mouseup', cleanup);
      };
      document.addEventListener('mouseup', cleanup);
    });
  });


  /* tile button interactive click-toggle */
  export var tileBtnStage = document.querySelector<HTMLElement>('#comp-section-tile-btn .comp-preview-stage');
  if (tileBtnStage) {
    tileBtnStage.addEventListener('click', function (e) {
      var btn = (e.target as HTMLElement).closest<HTMLButtonElement>('.pos-tile-btn');
      if (!btn || btn.disabled || btn.getAttribute('aria-disabled') === 'true') return;
      var isSelected = btn.classList.contains('pos-tile-btn--selected');
      tileBtnStage.querySelectorAll<HTMLElement>('.pos-tile-btn').forEach(function (b) {
        b.classList.remove('pos-tile-btn--selected');
        b.setAttribute('aria-pressed', 'false');
      });
      if (!isSelected) {
        btn.classList.add('pos-tile-btn--selected');
        btn.setAttribute('aria-pressed', 'true');
      }
    });
  }

  export function getActivePreviewStage() {
    var section = document.getElementById('comp-section-' + state.comp);
    return section ? section.querySelector<HTMLElement>('.comp-preview-stage') : null;
  }