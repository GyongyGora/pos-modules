import { registerControl, setActiveToggle } from '../core/dom-utils.js';
import { getActivePreviewStage } from '../preview-stage.js';
import { tryRefreshInspect } from '../core/refresh-inspect.js';
import { TAG_INTENT_CLASSES } from '../comp-configs.js';
import { applyStatus } from '../apply-status.js';
import { state } from '../core/state.js';


  /* ── preview: tile button orientation ────────────────────────────────────
     Toggles .pos-tile-btn-group--vertical on the group wrapper.
     Horizontal = square tiles in a row (default).
     Vertical   = wide/landscape tiles stacked.
  ─────────────────────────────────────────────────────────────────────────── */
  export var orientationToggle = document.getElementById('comp-orientation-toggle');
  registerControl(orientationToggle, '[data-orientation-btn]', function (btn) {
    var orientation = btn.dataset.orientationBtn;
    setActiveToggle(orientationToggle, 'data-orientation-btn', orientation, 'pos-segmented-control-btn--active');
    var stage = getActivePreviewStage();
    if (stage) {
      stage.querySelectorAll<HTMLElement>('.pos-tile-btn-group').forEach(function (g) {
        g.classList.toggle('pos-tile-btn-group--vertical', orientation === 'vertical');
      });
    }
  });

  export var tagSizeToggle = document.getElementById('comp-tag-size-toggle');
  registerControl(tagSizeToggle, '[data-tag-size-btn]', function (btn) {
    var size = btn.dataset.tagSizeBtn;
    setActiveToggle(tagSizeToggle, 'data-tag-size-btn', size, 'pos-segmented-control-btn--active');
    state.size = size;
    var stage = getActivePreviewStage();
    if (stage) {
      stage.querySelectorAll<HTMLElement>('.pos-tag').forEach(function (el) {
        el.classList.toggle('pos-tag--small', size === 'small');
      });
    }
    tryRefreshInspect();
  });

  export var tagIntentList = document.getElementById('comp-tag-intent-list');
  registerControl(tagIntentList, '[data-tag-intent-btn]', function (btn) {
    var intent = btn.dataset.tagIntentBtn;
    setActiveToggle(tagIntentList, 'data-tag-intent-btn', intent, 'pos-tile-btn--selected');
    var stage = getActivePreviewStage();
    if (stage) {
      stage.querySelectorAll<HTMLElement>('.pos-tag').forEach(function (el) {
        el.classList.remove.apply(el.classList, TAG_INTENT_CLASSES);
        if (intent !== 'default') el.classList.add('pos-tag-' + intent);
      });
    }
    state.tagIntent = intent;
  });

  export var popoverIntentList = document.getElementById('comp-popover-intent-list');
  if (popoverIntentList) {
    registerControl(popoverIntentList, '[data-popover-intent-btn]', function (btn) {
      var intent = btn.dataset.popoverIntentBtn;
      setActiveToggle(popoverIntentList, 'data-popover-intent-btn', intent, 'pos-tile-btn--selected');
      var popoverStageEl = document.getElementById('comp-popover-preview');
      if (popoverStageEl) {
        popoverStageEl.querySelectorAll<HTMLElement>('[data-comp-important-item]').forEach(function (el) {
          el.classList.toggle('pos-popover-menu-item-important', intent === 'important');
        });
      }
      tryRefreshInspect();
    });
  }

  export var popoverStateToggle = document.getElementById('comp-popover-state-toggle');
  registerControl(popoverStateToggle, '[data-popover-state-btn]', function (btn) {
    var toggleState = btn.dataset.popoverStateBtn;
    setActiveToggle(popoverStateToggle, 'data-popover-state-btn', toggleState, 'pos-tile-btn--selected');
    var menuPreview = document.getElementById('comp-popover-preview');
    if (menuPreview) {
      menuPreview.classList.toggle('is-opened', toggleState !== 'closed');
      menuPreview.querySelectorAll<HTMLElement>('menu li a, menu li button').forEach(function (el) {
        el.classList.remove('pos-debug-popover-item-hover');
        if (toggleState === 'hover') el.classList.add('pos-debug-popover-item-hover');
      });
    }
    state.status = toggleState;
    tryRefreshInspect();
  });

  export var popoverContentStateToggle = document.getElementById('comp-popover-content-state-toggle');
  registerControl(popoverContentStateToggle, '[data-popover-content-state-btn]', function (btn) {
    var toggleState = btn.dataset.popoverContentStateBtn;
    setActiveToggle(popoverContentStateToggle, 'data-popover-content-state-btn', toggleState, 'pos-segmented-control-btn--active');
    var contentPreview = document.getElementById('comp-popover-content-preview');
    if (contentPreview) contentPreview.classList.toggle('is-opened', toggleState === 'opened');
    state.status = toggleState;
    tryRefreshInspect();
  });

  export var tooltipStateToggle = document.getElementById('comp-tooltip-state-toggle');
  registerControl(tooltipStateToggle, '[data-tooltip-state-btn]', function (btn) {
    var toggleState = btn.dataset.tooltipStateBtn;
    setActiveToggle(tooltipStateToggle, 'data-tooltip-state-btn', toggleState, 'pos-tile-btn--selected');
    var tooltipStage = document.getElementById('comp-tooltip-preview');
    if (tooltipStage) {
      tooltipStage.querySelectorAll<HTMLElement>('[data-tooltip], .pos-tooltip-anchor').forEach(function (el) {
        el.classList.toggle('pos-debug-tooltip-visible', toggleState === 'visible');
      });
    }
    state.status = toggleState;
    tryRefreshInspect();
  });

  /* Type: Text / Icon-text — same as the Figma Tooltip's Type property; shows that type's row,
     the State (Hidden / Visible) carries over */
  export var tooltipTypeToggle = document.getElementById('comp-tooltip-type-toggle');
  registerControl(tooltipTypeToggle, '[data-tooltip-type-btn]', function (btn) {
    var type = btn.dataset.tooltipTypeBtn;
    setActiveToggle(tooltipTypeToggle, 'data-tooltip-type-btn', type, 'pos-segmented-control-btn--active');
    var tooltipStage = document.getElementById('comp-tooltip-preview');
    if (tooltipStage) {
      tooltipStage.querySelectorAll<HTMLElement>('.comp-preview-variant-row[data-variant]').forEach(function (row) {
        row.hidden = row.dataset.variant !== type;
      });
    }
    tryRefreshInspect();
  });

  export var selectStateToggle = document.getElementById('comp-select-state-toggle');
  registerControl(selectStateToggle, '[data-select-state-btn]', function (btn) {
    var toggleState = btn.dataset.selectStateBtn;
    setActiveToggle(selectStateToggle, 'data-select-state-btn', toggleState, 'pos-tile-btn--selected');
    applyStatus(toggleState);
  });

  export var multiselectStateToggle = document.getElementById('comp-multiselect-state-toggle');
  registerControl(multiselectStateToggle, '[data-multiselect-state-btn]', function (btn) {
    var toggleState = btn.dataset.multiselectStateBtn;
    setActiveToggle(multiselectStateToggle, 'data-multiselect-state-btn', toggleState, 'pos-tile-btn--selected');
    applyStatus(toggleState);
  });

  export var multiselectOptions = document.getElementById('comp-multiselect-options');
  if (multiselectOptions) {
    multiselectOptions.addEventListener('change', function (e) {
      var chk = (e.target as HTMLElement).closest<HTMLInputElement>('input[type="checkbox"]');
      if (!chk) return;
      var ms = document.getElementById('comp-multiselect-field');
      if (!ms) return;
      var opt = chk.dataset.msOption;
      if (opt === 'multiline') ms.classList.toggle('pos-form-multiselect-multiline', chk.checked);
      if (opt === 'combined')  ms.classList.toggle('pos-form-multiselect-combine', chk.checked);
      if (opt === 'filter') {
        var filterWrapper = document.getElementById('comp-multiselect-filter-wrapper');
        if (filterWrapper) filterWrapper.hidden = !chk.checked;
      }
      tryRefreshInspect();
    });
  }

  export var passwordStateToggle = document.getElementById('comp-password-state-toggle');
  registerControl(passwordStateToggle, '[data-password-state-btn]', function (btn) {
    var toggleState = btn.dataset.passwordStateBtn;
    setActiveToggle(passwordStateToggle, 'data-password-state-btn', toggleState, 'pos-tile-btn--selected');
    applyStatus(toggleState);
  });

  export var passwordOptions = document.getElementById('comp-password-options');
  if (passwordOptions) {
    passwordOptions.addEventListener('change', function (e) {
      var chk = (e.target as HTMLElement).closest<HTMLInputElement>('input[type="checkbox"]');
      if (!chk) return;
      var opt = chk.dataset.pwOption;
      if (opt === 'meter') {
        var meter     = document.getElementById('comp-password-meter');
        var desc      = document.getElementById('comp-password-strength-desc');
        var strGroup  = document.getElementById('comp-pw-strength-group');
        if (meter)    meter.hidden    = !chk.checked;
        if (desc)     desc.hidden     = !chk.checked;
        if (strGroup) strGroup.hidden = !chk.checked;
        if (!chk.checked) {
          var pwContainer = document.getElementById('comp-password-container');
          if (pwContainer) {
            pwContainer.classList.remove('pos-form-password-strength-1', 'pos-form-password-strength-2', 'pos-form-password-strength-3');
          }
          if (strGroup) {
            setActiveToggle(strGroup, 'data-pw-strength-btn', '0', 'pos-segmented-control-btn--active');
          }
        }
      }
      tryRefreshInspect();
    });
  }

  export var pwStrengthToggle = document.getElementById('comp-pw-strength-toggle');
  registerControl(pwStrengthToggle, '[data-pw-strength-btn]', function (btn) {
    var level = btn.dataset.pwStrengthBtn;
    setActiveToggle(pwStrengthToggle, 'data-pw-strength-btn', level, 'pos-segmented-control-btn--active');
    var pwContainer = document.getElementById('comp-password-container');
    if (pwContainer) {
      pwContainer.classList.remove('pos-form-password-strength-1', 'pos-form-password-strength-2', 'pos-form-password-strength-3');
      if (level !== '0') pwContainer.classList.add('pos-form-password-strength-' + level);
    }
    tryRefreshInspect();
  });