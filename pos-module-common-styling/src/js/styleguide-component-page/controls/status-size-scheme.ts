import { registerControl, setActiveToggle } from '../core/dom-utils.js';
import { applyStatus } from '../apply-status.js';
import { getActivePreviewStage, getPreviewButtons, previewStage } from '../preview-stage.js';
import { state } from '../core/state.js';
import { tryRefreshInspect } from '../core/refresh-inspect.js';
import { BUTTON_INTENT_CLASSES, ICON_SIZE_MAP } from '../comp-configs.js';



  export var statusGrid = document.getElementById('comp-status-grid');
  if (statusGrid) {
    statusGrid.addEventListener('click', function (e) {
      var btn = (e.target as HTMLElement).closest<HTMLElement>('[data-status-btn]');
      if (!btn) return;
      var status = btn.dataset.statusBtn;

      setActiveToggle(statusGrid, 'data-status-btn', status, 'pos-tile-btn--selected');
      applyStatus(status);
    });
  }


  /* ── preview: apply size to buttons ─────────────────────────────
     Toggles .pos-button-small on all preview buttons.
  ─────────────────────────────────────────────────────────────────── */
  export var sizeToggle = document.getElementById('comp-size-toggle');
  if (sizeToggle) {
    sizeToggle.addEventListener('click', function (e) {
      var btn = (e.target as HTMLElement).closest<HTMLElement>('[data-size-btn]');
      if (!btn) return;
      var size = btn.dataset.sizeBtn;

      setActiveToggle(sizeToggle, 'data-size-btn', size, 'pos-segmented-control-btn--active');

      var stage = getActivePreviewStage() || previewStage;
      if (state.comp === 'segmented') {
        stage.querySelectorAll<HTMLElement>('.pos-segmented-control').forEach(function (tg) {
          tg.classList.remove('pos-segmented-control--small');
          if (size === 'small') tg.classList.add('pos-segmented-control--small');
        });
      } else if (state.comp === 'link') {
        stage.querySelectorAll<HTMLElement>('.pos-link').forEach(function (a) {
          a.classList.toggle('pos-link--small', size === 'small');
        });
      } else {
        getPreviewButtons().forEach(function (b) {
          b.classList.remove('pos-button-small');
          if (size === 'small') b.classList.add('pos-button-small');
        });
      }
      if (stage) stage.dataset.size = size;
      state.size = size;
      tryRefreshInspect();
    });
  }


  /* ── preview: icon size (S / M / L) — control icons only ──────────────
     Sets font-size on .pos-close and .pos-chevron inside the active
     preview stage. SVG uses width/height:1em so font-size drives size.
  ───────────────────────────────────────────────────────────────────── */

  export var iconSizeToggle   = document.getElementById('comp-icon-size-toggle');

  export function applyIconSize(size: string): void {
    state.iconSize = size;
    var sz  = ICON_SIZE_MAP[size] || ICON_SIZE_MAP['m'];
    var stage = getActivePreviewStage();
    if (stage) {
      stage.querySelectorAll<HTMLElement>('.pos-close, .pos-chevron').forEach(function (el) {
        el.style.fontSize = 'var(' + sz.css + ')';
      });
    }
    tryRefreshInspect();
  }

  if (iconSizeToggle) {
    iconSizeToggle.addEventListener('click', function (e) {
      var btn = (e.target as HTMLElement).closest<HTMLElement>('[data-icon-size-btn]');
      if (!btn) return;
      var size = btn.dataset.iconSizeBtn;
      setActiveToggle(iconSizeToggle, 'data-icon-size-btn', size, 'pos-segmented-control-btn--active');
      applyIconSize(size);
    });
  }


  /* ── preview: scheme (Default / Inverted) ───────────────────────
     Sets data-scheme on the preview stage; apply inverted class to buttons.
  ─────────────────────────────────────────────────────────────────── */
  export var schemeToggle = document.getElementById('comp-scheme-toggle');
  registerControl(schemeToggle, '[data-scheme-btn]', function (btn) {
    var scheme = btn.dataset.schemeBtn;
    setActiveToggle(schemeToggle, 'data-scheme-btn', scheme, 'pos-segmented-control-btn--active');
    previewStage.dataset.scheme = scheme;
  });


  /* ── preview: button base (Primary / Secondary filled / Secondary) ──────
     Filters the preview to one base row at a time — Primary and Secondary
     use entirely different tokens, so the Tokens/Code panels need to know
     which one is "selected", not just show all three at once (decided
     2026-08-25, option B2). This is the canonical
     position-1 "Variant" control group (feedback_control_group_order) —
     Button simply didn't have one until now.
  ───────────────────────────────────────────────────────────────────────── */

  export var buttonBaseToggle = document.getElementById('comp-button-base-toggle');
  registerControl(buttonBaseToggle, '[data-button-base-btn]', function (btn) {
    var base = btn.dataset.buttonBaseBtn;
    setActiveToggle(buttonBaseToggle, 'data-button-base-btn', base, 'pos-tile-btn--selected');
    var stage = getActivePreviewStage() || previewStage;
    if (stage) {
      stage.querySelectorAll<HTMLElement>('.comp-preview-variant-row[data-base]').forEach(function (row) {
        row.hidden = row.dataset.base !== base;
      });
    }
    state.buttonBase = base;
    tryRefreshInspect();
  });
  export var intentList = document.getElementById('comp-intent-list');
  registerControl(intentList, '[data-intent-btn]', function (btn) {
    var intent = btn.dataset.intentBtn;
    setActiveToggle(intentList, 'data-intent-btn', intent, 'pos-tile-btn--selected');
    previewStage.dataset.intent = intent;
    if (state.comp === 'button') {
      getPreviewButtons().forEach(function (b) {
        b.classList.remove.apply(b.classList, BUTTON_INTENT_CLASSES);
        if (intent !== 'default') b.classList.add('pos-button-' + intent);
      });
      if (intent === 'inverted') {
        previewStage.dataset.scheme = 'inverted';
      } else {
        delete previewStage.dataset.scheme;
      }
      state.buttonIntent = (intent === 'default') ? 'none' : intent;
      tryRefreshInspect();
    }
  });