import { state } from '../core/state.js';
import { registerControl, setActiveToggle } from '../core/dom-utils.js';
import { getActivePreviewStage } from '../preview-stage.js';
import { renderTokenPanel } from '../token-panel.js';
import { tryRefreshInspect } from '../core/refresh-inspect.js';



  /* form intent toggle (text-input / textarea / select)
     intent is orthogonal to State (hover/focus/opened/...) — e.g. a select
     can be both "hovered" and "in error" at once, so it's tracked separately
     from state.status instead of overwriting it. */

  export var formIntentList = document.getElementById('comp-form-intent-list');
  if (formIntentList) {
    formIntentList.addEventListener('click', function (e) {
      var btn = (e.target as HTMLElement).closest<HTMLElement>('[data-form-intent-btn]');
      if (!btn) return;
      var intent = btn.dataset.formIntentBtn;
      state.intent = intent;
      setActiveToggle(formIntentList, 'data-form-intent-btn', intent, 'pos-tile-btn--selected');
      var stage = getActivePreviewStage();
      if (!stage) return;
      var prefixMap: Record<string, string> = { 'text-input': 'comp-text-input', textarea: 'comp-textarea', select: 'comp-select' };
      var prefix = prefixMap[state.comp];
      var inputs = state.comp === 'select'
        ? stage.querySelectorAll<HTMLElement>('select')
        : stage.querySelectorAll<HTMLElement>('.pos-form-input:not(select)');
      inputs.forEach(function (inp) {
        inp.removeAttribute('aria-invalid');
        if (intent === 'error')   inp.setAttribute('aria-invalid', 'true');
        if (intent === 'success') inp.setAttribute('aria-invalid', 'false');
      });
      if (prefix) {
        var errEl     = document.getElementById(prefix + '-error');
        var successEl = document.getElementById(prefix + '-success');
        if (errEl)     errEl.hidden     = (intent !== 'error');
        if (successEl) successEl.hidden = (intent !== 'success');
      }
      /* re-render both panels for the CURRENT state — the intent is merged in,
         not swapped for it, so whatever State button is active stays active */
      renderTokenPanel(state.status, state.size);
      tryRefreshInspect();
    });
  }

  export var textInputOptions = document.getElementById('comp-text-input-options');
  if (textInputOptions) {
    textInputOptions.addEventListener('change', function (e) {
      var chk = (e.target as HTMLElement).closest<HTMLInputElement>('input[type="checkbox"]');
      if (!chk) return;
      var stage = document.getElementById('comp-text-input-preview');
      if (!stage) return;
      if (chk.dataset.option === 'required') {
        stage.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('.pos-form-input').forEach(function (inp) {
          inp.required = chk.checked;
        });
      }
      tryRefreshInspect();
    });
  }

  export var textareaOptions = document.getElementById('comp-textarea-options');
  if (textareaOptions) {
    textareaOptions.addEventListener('change', function (e) {
      var chk = (e.target as HTMLElement).closest<HTMLInputElement>('input[type="checkbox"]');
      if (!chk) return;
      var stage = document.getElementById('comp-textarea-preview');
      if (!stage) return;
      if (chk.dataset.option === 'required') {
        stage.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('.pos-form-input').forEach(function (inp) {
          inp.required = chk.checked;
        });
      }
      tryRefreshInspect();
    });
  }

  export var selectOptions = document.getElementById('comp-select-options');
  if (selectOptions) {
    selectOptions.addEventListener('change', function (e) {
      var chk = (e.target as HTMLElement).closest<HTMLInputElement>('input[type="checkbox"]');
      if (!chk) return;
      var stage = document.getElementById('comp-select-preview');
      if (!stage) return;
      var input = stage.querySelector<HTMLSelectElement>('select');
      if (chk.dataset.option === 'required' && input) {
        input.required = chk.checked;
      }
      tryRefreshInspect();
    });
  }

  /* select preview — auto-apply filled class when user picks an option */
  export var compSelectField = document.getElementById('comp-select-field') as HTMLInputElement | null;
  if (compSelectField) {
    compSelectField.addEventListener('change', function () {
      var filled = compSelectField.value !== '';
      compSelectField.classList.toggle('pos-debug-form-input-filled', filled);
    });
  }

  /* Badge — type (Dot / Number / Max count) × size (Small / Big) × intent on the one preview badge.
     getBadgeVariantSections() reads the result back off its classes. */
  var BADGE_CONTENT: Record<string, string> = { 'dot': '', 'number': '9', 'max-count': '99+' };
  function applyBadge(type: string | null, size: string | null) {
    var el = document.getElementById('comp-badge-el');
    if (!el) return;
    if (type) {
      ['dot', 'number', 'max-count'].forEach(function (t) { el!.classList.toggle('pos-badge--' + t, t === type); });
      el.textContent = BADGE_CONTENT[type];
      if (type === 'dot') el.setAttribute('aria-hidden', 'true'); else el.removeAttribute('aria-hidden');
    }
    if (size) ['small', 'big'].forEach(function (s) { el!.classList.toggle('pos-badge--' + s, s === size); });
  }
  function applyBadgeIntent(intent: string) {
    var el = document.getElementById('comp-badge-el');
    if (!el) return;
    ['important', 'confirmation', 'brand', 'neutral'].forEach(function (i) { el!.classList.toggle('pos-badge--' + i, i === intent && i !== 'important'); });
  }
  export var badgeVariantToggle = document.getElementById('comp-badge-variant-toggle');
  registerControl(badgeVariantToggle, '[data-badge-variant-btn]', function (btn) {
    var v = btn.dataset.badgeVariantBtn || 'number';
    setActiveToggle(badgeVariantToggle, 'data-badge-variant-btn', v, 'pos-segmented-control-btn--active');
    applyBadge(v, null);
    tryRefreshInspect();
  });
  export var badgeSizeToggle = document.getElementById('comp-badge-size-toggle');
  registerControl(badgeSizeToggle, '[data-badge-size-btn]', function (btn) {
    var s = btn.dataset.badgeSizeBtn || 'big';
    setActiveToggle(badgeSizeToggle, 'data-badge-size-btn', s, 'pos-segmented-control-btn--active');
    applyBadge(null, s);
    tryRefreshInspect();
  });
  export var badgeIntentToggle = document.getElementById('comp-badge-intent-list');
  registerControl(badgeIntentToggle, '[data-badge-intent-btn]', function (btn) {
    var i = btn.dataset.badgeIntentBtn || 'important';
    setActiveToggle(badgeIntentToggle, 'data-badge-intent-btn', i, 'pos-tile-btn--selected');
    applyBadgeIntent(i);
    tryRefreshInspect();
  });
  /* back to Number / Big / Important on every fresh visit to the section */
  export function resetBadgePreview() {
    if (badgeVariantToggle) setActiveToggle(badgeVariantToggle, 'data-badge-variant-btn', 'number', 'pos-segmented-control-btn--active');
    if (badgeSizeToggle) setActiveToggle(badgeSizeToggle, 'data-badge-size-btn', 'big', 'pos-segmented-control-btn--active');
    if (badgeIntentToggle) setActiveToggle(badgeIntentToggle, 'data-badge-intent-btn', 'important', 'pos-tile-btn--selected');
    applyBadge('number', 'big');
    applyBadgeIntent('important');
  }

  export var chipSizeToggle = document.getElementById('comp-chip-size-toggle');
  registerControl(chipSizeToggle, '[data-chip-size-btn]', function (btn) {
    var size = btn.dataset.chipSizeBtn;
    setActiveToggle(chipSizeToggle, 'data-chip-size-btn', size, 'pos-segmented-control-btn--active');
    var chipNormal    = document.getElementById('comp-chip-normal');
    var chipProminent = document.getElementById('comp-chip-prominent');
    [chipNormal, chipProminent].forEach(function (chip) {
      if (!chip) return;
      chip.classList.toggle('pos-chip--tiny', size === 'tiny');
    });
    tryRefreshInspect();
  });

  /* tracked for the code.json spec-driven Tokens tab — mirror what the toggles below already
     apply to the preview, don't change that logic */

  /* Kind — added 2026-08-26, filters the preview to inline OR block at a time (same B2 pattern as
     Button's Base toggle) instead of showing both simultaneously. */
  export var codeKindToggle = document.getElementById('comp-code-kind-toggle');
  registerControl(codeKindToggle, '[data-code-kind-btn]', function (btn) {
    var kind = btn.dataset.codeKindBtn;
    setActiveToggle(codeKindToggle, 'data-code-kind-btn', kind, 'pos-segmented-control-btn--active');
    var stage = getActivePreviewStage();
    if (stage) {
      stage.querySelectorAll<HTMLElement>('[data-kind]').forEach(function (el) {
        el.hidden = el.dataset.kind !== kind;
      });
    }
    state.codeKind = kind;
    tryRefreshInspect();
  });

  export var codeVariantToggle = document.getElementById('comp-code-variant-toggle');
  registerControl(codeVariantToggle, '[data-code-variant-btn]', function (btn) {
    var variant = btn.dataset.codeVariantBtn;
    setActiveToggle(codeVariantToggle, 'data-code-variant-btn', variant, 'pos-segmented-control-btn--active');
    var inlineEl = document.getElementById('comp-code-inline');
    var blockPre = document.getElementById('comp-code-block');
    if (inlineEl) inlineEl.classList.toggle('pos-code--dark', variant === 'dark');
    if (blockPre) blockPre.classList.toggle('pos-code--light', variant === 'light');
    state.codeVariant = variant;
    tryRefreshInspect();
  });

  /* Size toggle — unified 2026-08-26 (was inline-only, "Size — inline") to also resize the block
     example: a plain Size toggle that affects both. */
  export var codeInlineSizeToggle = document.getElementById('comp-code-inline-size-toggle');
  registerControl(codeInlineSizeToggle, '[data-code-inline-size-btn]', function (btn) {
    var size = btn.dataset.codeInlineSizeBtn;
    setActiveToggle(codeInlineSizeToggle, 'data-code-inline-size-btn', size, 'pos-segmented-control-btn--active');
    var inlineEl = document.getElementById('comp-code-inline');
    var blockPre = document.getElementById('comp-code-block');
    if (inlineEl) inlineEl.classList.toggle('pos-code--small', size === 'small');
    if (blockPre) blockPre.classList.toggle('pos-code--small', size === 'small');
    state.codeSize = size;
    tryRefreshInspect();
  });

  export var codeLnToggle = document.getElementById('comp-code-ln-toggle') as HTMLInputElement | null;
  if (codeLnToggle) {
    codeLnToggle.addEventListener('change', function () {
      var on = codeLnToggle.checked;
      var cc = window.pos && window.pos.modules && window.pos.modules.codeCopy;
      var pre = document.getElementById('comp-code-block');
      if (!pre) return;
      pre.classList.toggle('pos-code--numbered', on);
      if (cc) {
        if (on) cc.addLineNumbers(pre);
        else    cc.removeLineNumbers(pre);
      }
      state.codeNumbered = on;
      tryRefreshInspect();
    });
  }