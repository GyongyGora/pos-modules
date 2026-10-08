import { state } from './core/state.js';
import { BUTTON_INTENT_CLASSES, CHIP_INTENT_CLASSES, COMP_CONFIGS } from './comp-configs.js';
import { rightTitle } from './core/dom-refs.js';
import { setActiveToggle, registerControl } from './core/dom-utils.js';
import { applyStatus } from './apply-status.js';
import { getActivePreviewStage, getPreviewButtons, previewStage } from './preview-stage.js';
import { multiselectOptions, multiselectStateToggle, passwordStateToggle, popoverContentStateToggle, popoverStateToggle, pwStrengthToggle, selectStateToggle, tagIntentList, tagSizeToggle, tooltipStateToggle, tooltipTypeToggle } from './controls/tags-popovers-fields.js';
import { chipIntentList, setTagStateButtonsForKind } from './controls/cards-misc.js';
import { resetBadgePreview, chipSizeToggle, codeKindToggle, codeLnToggle, codeVariantToggle, formIntentList, selectOptions, textInputOptions, textareaOptions } from './controls/forms-code.js';
import { tryRefreshInspect } from './core/refresh-inspect.js';
import { buttonBaseToggle, iconSizeToggle, intentList, schemeToggle } from './controls/status-size-scheme.js';
import { renderCodePanel } from './code-snippet.js';
import { renderUsageTab } from './usage-tab.js';
import { tokensPanel } from './panel-resize.js';
import { renderTokenPanel } from './token-panel.js';



  export function switchComponent(key: string) {
    if (key === state.comp && state.tokenMap !== null) return;
    var cfg = COMP_CONFIGS[key];
    if (!cfg) return;
    state.comp = key;
    state.tokenMap = cfg.tokens;

    /* update name */
    if (rightTitle) rightTitle.textContent = cfg.name;

    /* show/hide control sections */
    document.querySelectorAll<HTMLElement>('[data-comp-control]').forEach(function (el) {
      el.hidden = cfg.controls.indexOf(el.dataset.compControl) === -1;
    });

    /* recalculate sliding indicators — controls were hidden (offsetLeft = 0)
       until this switch; a resize event triggers update() in each indicator */
    requestAnimationFrame(function () {
      window.dispatchEvent(new Event('resize'));
    });

    /* reset state */
    state.status = 'normal';
    state.size   = 'default';

    /* show/hide individual state buttons based on component's valid states */
    var validStates = cfg.states || ['normal', 'hover', 'focus', 'active', 'disabled', 'loading'];
    document.querySelectorAll<HTMLButtonElement>('[data-status-btn]').forEach(function (b) {
      b.style.display = validStates.indexOf(b.dataset.statusBtn) === -1 ? 'none' : '';
      var active = b.dataset.statusBtn === 'normal';
      b.classList.toggle('pos-tile-btn--selected', active);
      b.setAttribute('aria-pressed', active ? 'true' : 'false');
      b.disabled = false;
    });

    /* reset size toggle UI */
    setActiveToggle(document, 'data-size-btn', 'default', 'pos-segmented-control-btn--active');

    /* reset preview to normal — applyStatus is the single source of truth per component */
    applyStatus('normal');
    var stage = getActivePreviewStage();
    if (stage) {
      /* reset tag intent classes */
      stage.querySelectorAll<HTMLElement>('.pos-tag').forEach(function (el) {
        el.classList.remove('pos-tag-neutral', 'pos-tag-confirmation', 'pos-tag-warning', 'pos-tag-important');
      });
      /* reset tag size */
      if (tagSizeToggle) {
        setActiveToggle(tagSizeToggle, 'data-tag-size-btn', 'default', 'pos-segmented-control-btn--active');
        stage.querySelectorAll<HTMLElement>('.pos-tag').forEach(function (el) {
          el.classList.remove('pos-tag--small');
        });
      }
      /* reset tag intent buttons */
      if (tagIntentList) {
        setActiveToggle(tagIntentList, 'data-tag-intent-btn', 'default', 'pos-tile-btn--selected');
      }
      /* reset the badge preview */
      resetBadgePreview();
      /* reset chip intent buttons */
      if (chipIntentList) {
        setActiveToggle(chipIntentList, 'data-chip-intent-btn', 'neutral', 'pos-tile-btn--selected');
        var chipNormal   = document.getElementById('comp-chip-normal');
        var chipProminent = document.getElementById('comp-chip-prominent');
        [chipNormal, chipProminent].forEach(function (chip) {
          if (!chip) return;
          chip.classList.remove.apply(chip.classList, CHIP_INTENT_CLASSES);
          chip.classList.add('pos-chip-neutral');
          chip.classList.remove('pos-chip--tiny');
        });
        /* reset chip size toggle */
        if (chipSizeToggle) {
          setActiveToggle(chipSizeToggle, 'data-chip-size-btn', 'default', 'pos-segmented-control-btn--active');
        }
      }
      /* reset chip/segmented/tag variant toggles (2026-08-26 component migration batch) — filters
         the preview back to its default row on every fresh visit to the section, same reset
         discipline as Button's Base toggle and Code's Kind toggle. Scoped to `stage` (the current
         section's own preview), so these no-op harmlessly for every other component. */
      var defaultVariantByToggleId: Record<string, { key: string; attr: string; value: string; activeClass: string }> = {
        'comp-chip-variant-toggle': { key: 'chip', attr: 'data-chip-variant-btn', value: 'normal', activeClass: 'pos-segmented-control-btn--active' },
        'comp-segmented-variant-toggle': { key: 'segmented', attr: 'data-segmented-variant-btn', value: 'default', activeClass: 'pos-segmented-control-btn--active' },
        'comp-tag-kind-toggle': { key: 'tag', attr: 'data-tag-kind-btn', value: 'default', activeClass: 'pos-segmented-control-btn--active' },
        'comp-control-icons-kind-toggle': { key: 'control-icons', attr: 'data-control-icons-kind-btn', value: 'close', activeClass: 'pos-segmented-control-btn--active' },
        /* tile-btn, not segmented-control, per the 2026-09-03 Intent redesign (vertical tile
           buttons with icons, matching Tag's own Intent list) — activeClass distinguishes this
           from the segmented-control-based toggles above. */
        'comp-alert-card-variant-toggle': { key: 'alert-card', attr: 'data-alert-card-variant-btn', value: 'info', activeClass: 'pos-tile-btn--selected' },
        'comp-toast-variant-toggle': { key: 'toast', attr: 'data-toast-variant-btn', value: 'success', activeClass: 'pos-tile-btn--selected' },
        'comp-dialog-variant-toggle': { key: 'dialog', attr: 'data-dialog-variant-btn', value: 'default', activeClass: 'pos-segmented-control-btn--active' },
        'comp-table-variant-toggle': { key: 'table', attr: 'data-table-variant-btn', value: 'default', activeClass: 'pos-segmented-control-btn--active' },
        'comp-tab-variant-toggle': { key: 'tab', attr: 'data-tab-variant-btn', value: 'detailed', activeClass: 'pos-segmented-control-btn--active' },
        'comp-toggle-btn-state-toggle': { key: 'toggle-btn', attr: 'data-toggle-btn-state-btn', value: 'off', activeClass: 'pos-segmented-control-btn--active' },
      };
      var activeVariantDef: { key: string; attr: string; value: string; activeClass: string } | null = null;
      Object.keys(defaultVariantByToggleId).forEach(function (toggleId: string) {
        var toggle = document.getElementById(toggleId);
        if (!toggle) return;
        var def = defaultVariantByToggleId[toggleId];
        if (def.key === key) activeVariantDef = def;
        toggle.querySelectorAll<HTMLElement>('[' + def.attr + ']').forEach(function (b) {
          var active = b.getAttribute(def.attr) === def.value;
          b.classList.toggle(def.activeClass, active);
          b.setAttribute('aria-pressed', active ? 'true' : 'false');
        });
      });
      if (key === 'tag') {
        setTagStateButtonsForKind('default');
      }
      /* keyed to the CURRENT component only (def.key === key) — checking a row's data-variant
         against a flat list merged from every registered toggle's default value let one
         component's default (e.g. Alert card's "info") incorrectly keep another component's
         same-named row visible too (e.g. Toast's own "info" row, since both vocabularies overlap
         on info/success/error) whenever that other stage was reset. Fixed 2026-09-03. */
      if (activeVariantDef) {
        stage.querySelectorAll<HTMLElement>('.comp-preview-variant-row[data-variant]').forEach(function (row) {
          row.hidden = row.dataset.variant !== activeVariantDef.value;
        });
      }
      stage.dataset.status = 'normal';
      stage.dataset.size   = 'default';
    }

    /* reset tile-btn orientation */
    if (key === 'tile-btn') {
      if (stage) {
        stage.querySelectorAll<HTMLElement>('.pos-tile-btn-group').forEach(function (g) {
          g.classList.remove('pos-tile-btn-group--vertical');
        });
      }
      var orientationToggle = document.getElementById('comp-orientation-toggle');
      if (orientationToggle) {
        setActiveToggle(orientationToggle, 'data-orientation-btn', 'horizontal', 'pos-segmented-control-btn--active');
      }
    }

    /* reset popover menu state to opened */
    if (key === 'popover') {
      state.status = 'opened';
      var menuStageReset = document.getElementById('comp-popover-preview');
      if (menuStageReset) {
        menuStageReset.classList.add('is-opened');
        menuStageReset.querySelectorAll<HTMLElement>('menu li a, menu li button').forEach(function (el) {
          el.classList.remove('pos-debug-popover-item-hover');
        });
      }
      if (popoverStateToggle) {
        setActiveToggle(popoverStateToggle, 'data-popover-state-btn', 'opened', 'pos-tile-btn--selected');
      }
      tryRefreshInspect();
    }

    /* reset popover-content state to opened */
    if (key === 'popover-content') {
      state.status = 'opened';
      var contentStageReset = document.getElementById('comp-popover-content-preview');
      if (contentStageReset) contentStageReset.classList.add('is-opened');
      if (popoverContentStateToggle) {
        setActiveToggle(popoverContentStateToggle, 'data-popover-content-state-btn', 'opened', 'pos-segmented-control-btn--active');
      }
      tryRefreshInspect();
    }

    /* reset tooltip state to normal (hidden) — its own custom tile grid uses data-tooltip-state-btn,
       not the shared [data-status-btn] vocabulary, so the generic reset above never touches it */
    if (key === 'tooltip') {
      state.status = 'normal';
      var tooltipStageReset = document.getElementById('comp-tooltip-preview');
      if (tooltipStageReset) {
        tooltipStageReset.querySelectorAll<HTMLElement>('[data-tooltip], .pos-tooltip-anchor').forEach(function (el) {
          el.classList.remove('pos-debug-tooltip-visible');
        });
        tooltipStageReset.querySelectorAll<HTMLElement>('.comp-preview-variant-row[data-variant]').forEach(function (row) {
          row.hidden = row.dataset.variant !== 'text';
        });
      }
      if (tooltipStateToggle) {
        setActiveToggle(tooltipStateToggle, 'data-tooltip-state-btn', 'normal', 'pos-tile-btn--selected');
      }
      if (tooltipTypeToggle) {
        setActiveToggle(tooltipTypeToggle, 'data-tooltip-type-btn', 'text', 'pos-segmented-control-btn--active');
      }
      tryRefreshInspect();
    }

    /* reset text input */
    if (key === 'text-input') {
      var tiStageReset = document.getElementById('comp-text-input-preview');
      if (tiStageReset) {
        tiStageReset.querySelectorAll<HTMLInputElement>('.pos-form-input').forEach(function (inp) {
          inp.classList.remove('pos-debug-form-input-hover', 'pos-debug-form-input-focus-visible', 'pos-debug-form-input-filled');
          inp.disabled = false;
          inp.required = false;
          inp.removeAttribute('readonly');
          inp.removeAttribute('aria-invalid');
          inp.value = '';
        });
        var tiErrorReset   = document.getElementById('comp-text-input-error');
        var tiSuccessReset = document.getElementById('comp-text-input-success');
        if (tiErrorReset)   tiErrorReset.hidden   = true;
        if (tiSuccessReset) tiSuccessReset.hidden  = true;
      }
      if (textInputOptions) {
        textInputOptions.querySelectorAll<HTMLInputElement>('input[type="checkbox"]').forEach(function (chk) { chk.checked = false; });
      }
    }

    /* reset textarea */
    if (key === 'textarea') {
      var taStageReset = document.getElementById('comp-textarea-preview');
      if (taStageReset) {
        var taInputReset = taStageReset.querySelector<HTMLTextAreaElement>('.pos-form-input');
        if (taInputReset) {
          taInputReset.classList.remove('pos-debug-form-input-hover', 'pos-debug-form-input-focus-visible');
          taInputReset.disabled = false;
          taInputReset.required = false;
          taInputReset.removeAttribute('readonly');
          taInputReset.removeAttribute('aria-invalid');
          taInputReset.value = '';
        }
        var taErrorReset   = document.getElementById('comp-textarea-error');
        var taSuccessReset = document.getElementById('comp-textarea-success');
        if (taErrorReset)   taErrorReset.hidden   = true;
        if (taSuccessReset) taSuccessReset.hidden  = true;
      }
      if (textareaOptions) {
        textareaOptions.querySelectorAll<HTMLInputElement>('input[type="checkbox"]').forEach(function (chk) { chk.checked = false; });
      }
    }

    /* reset select */
    if (key === 'select') {
      state.status = 'closed';
      var selStageReset = document.getElementById('comp-select-preview');
      if (selStageReset) {
        var selInputReset = selStageReset.querySelector<HTMLSelectElement>('select');
        if (selInputReset) {
          selInputReset.classList.remove('pos-debug-form-input-hover', 'pos-debug-form-input-focus-visible', 'pos-debug-form-input-opened', 'pos-debug-form-input-filled');
          selInputReset.disabled = false;
          selInputReset.required = false;
          selInputReset.removeAttribute('aria-invalid');
          selInputReset.selectedIndex = 0;
        }
        var selErrorReset   = document.getElementById('comp-select-error');
        var selSuccessReset = document.getElementById('comp-select-success');
        if (selErrorReset)   selErrorReset.hidden   = true;
        if (selSuccessReset) selSuccessReset.hidden  = true;
      }
      if (selectStateToggle) {
        setActiveToggle(selectStateToggle, 'data-select-state-btn', 'closed', 'pos-tile-btn--selected');
      }
      if (selectOptions) {
        selectOptions.querySelectorAll<HTMLInputElement>('input[type="checkbox"]').forEach(function (chk) { chk.checked = false; });
      }
    }

    /* reset form-intent control to Normal for all form components */
    if (['text-input', 'textarea', 'select'].indexOf(key) !== -1) {
      if (formIntentList) {
        setActiveToggle(formIntentList, 'data-form-intent-btn', 'normal', 'pos-tile-btn--selected');
      }
      state.intent = 'normal';
    }

    /* reset multiselect */
    if (key === 'multiselect') {
      state.status = 'closed';
      var msField = document.getElementById('comp-multiselect-field');
      if (msField) {
        msField.classList.remove('pos-form-multiselect-opened', 'pos-debug-multiselect-disabled',
                                  'pos-form-multiselect-multiline', 'pos-form-multiselect-combine');
        var msInputReset = msField.querySelector<HTMLElement>('.pos-form-multiselect-input');
        if (msInputReset) {
          msInputReset.classList.remove('pos-debug-form-input-focus-visible', 'pos-debug-form-input-hover');
          msInputReset.removeAttribute('aria-disabled');
          msInputReset.setAttribute('tabindex', '0');
        }
        // Closed is the default state and shows no selection — drive the real
        // component API so checkboxes and tags stay in sync (Filled is the
        // only state that pre-selects Option A + B, see applyStatus above)
        var msModule = window.pos.modules.active && window.pos.modules.active['comp-multiselect-field'];
        if (msModule) msModule.clear();
        var msFilterWrapper = document.getElementById('comp-multiselect-filter-wrapper');
        if (msFilterWrapper) msFilterWrapper.hidden = true;
        var msFilterInput = document.getElementById('comp-multiselect-filter') as HTMLInputElement | null;
        if (msFilterInput) msFilterInput.value = '';
      }
      if (multiselectStateToggle) {
        setActiveToggle(multiselectStateToggle, 'data-multiselect-state-btn', 'closed', 'pos-tile-btn--selected');
      }
      if (multiselectOptions) {
        multiselectOptions.querySelectorAll<HTMLInputElement>('input[type="checkbox"]').forEach(function (chk) { chk.checked = false; });
      }
      tryRefreshInspect();
    }

    /* reset password */
    if (key === 'password') {
      state.status = 'normal';
      var pwContainerReset = document.getElementById('comp-password-container');
      var pwInputReset     = document.getElementById('comp-password-field') as HTMLInputElement | null;
      if (pwInputReset) {
        pwInputReset.classList.remove('pos-debug-form-input-hover', 'pos-debug-form-input-focus-visible');
        pwInputReset.disabled = false;
        pwInputReset.setAttribute('type', 'password');
        pwInputReset.value = '';
      }
      if (pwContainerReset) {
        pwContainerReset.classList.remove('pos-form-password-shown',
                                          'pos-form-password-strength-1',
                                          'pos-form-password-strength-2',
                                          'pos-form-password-strength-3');
      }
      var pwMeter     = document.getElementById('comp-password-meter');
      var pwDesc      = document.getElementById('comp-password-strength-desc');
      var pwStrGroup  = document.getElementById('comp-pw-strength-group');
      if (pwMeter)    pwMeter.hidden    = true;
      if (pwDesc)     pwDesc.hidden     = true;
      if (pwStrGroup) pwStrGroup.hidden = true;
      var pwMeterChk = document.getElementById('comp-pw-opt-meter') as HTMLInputElement | null;
      if (pwMeterChk) pwMeterChk.checked = false;
      if (passwordStateToggle) {
        setActiveToggle(passwordStateToggle, 'data-password-state-btn', 'normal', 'pos-tile-btn--selected');
      }
      if (pwStrengthToggle) {
        setActiveToggle(pwStrengthToggle, 'data-pw-strength-btn', '0', 'pos-segmented-control-btn--active');
      }
      tryRefreshInspect();
    }

    /* reset button intent, size, scheme */
    if (key === 'button') {
      BUTTON_INTENT_CLASSES.forEach(function (cls) {
        previewStage.querySelectorAll<HTMLElement>('.pos-button').forEach(function (b) { b.classList.remove(cls); });
      });
      previewStage.dataset.intent = 'default';
      state.buttonIntent = 'none';
      if (intentList) {
        setActiveToggle(intentList, 'data-intent-btn', 'default', 'pos-tile-btn--selected');
      }
      getPreviewButtons().forEach(function (b) { b.classList.remove('pos-button-small'); });
      delete previewStage.dataset.scheme;
      if (schemeToggle) {
        setActiveToggle(schemeToggle, 'data-scheme-btn', 'default', 'pos-segmented-control-btn--active');
      }
      /* reset Base/Variant toggle to Primary and re-filter the preview rows — switchComponent
         runs on every fresh visit/scroll to the Button section, and without this the toggle's
         default-active HTML state (Primary) was never actually applied to the preview, so all
         3 rows stayed visible until the user clicked a Variant button once. */
      state.buttonBase = 'primary';
      if (buttonBaseToggle) {
        setActiveToggle(buttonBaseToggle, 'data-button-base-btn', 'primary', 'pos-tile-btn--selected');
      }
      previewStage.querySelectorAll<HTMLElement>('.comp-preview-variant-row[data-base]').forEach(function (row) {
        row.hidden = row.dataset.base !== 'primary';
      });
      renderCodePanel();
    }

    /* reset Code component (pos-code) toggles to their defaults */
    if (key === 'code') {
      state.codeKind = 'inline';
      state.codeVariant = 'dark';
      state.codeSize = 'default';
      state.codeNumbered = false;
      if (codeKindToggle) {
        setActiveToggle(codeKindToggle, 'data-code-kind-btn', 'inline', 'pos-segmented-control-btn--active');
      }
      if (stage) {
        stage.querySelectorAll<HTMLElement>('[data-kind]').forEach(function (el) {
          el.hidden = el.dataset.kind !== 'inline';
        });
      }
      if (codeVariantToggle) {
        setActiveToggle(codeVariantToggle, 'data-code-variant-btn', 'dark', 'pos-segmented-control-btn--active');
      }
      if (codeInlineSizeToggle) {
        setActiveToggle(codeInlineSizeToggle, 'data-code-inline-size-btn', 'default', 'pos-segmented-control-btn--active');
      }
      if (codeLnToggle) codeLnToggle.checked = false;
      var codeInlineEl = document.getElementById('comp-code-inline');
      var codeBlockPre = document.getElementById('comp-code-block');
      if (codeInlineEl) codeInlineEl.classList.remove('pos-code--dark', 'pos-code--small');
      if (codeBlockPre) codeBlockPre.classList.remove('pos-code--light', 'pos-code--small', 'pos-code--numbered');
    }

    /* reset segmented size */
    if (key === 'segmented' && stage) {
      stage.querySelectorAll<HTMLElement>('.pos-segmented-control').forEach(function (tg) {
        tg.classList.remove('pos-segmented-control--small');
      });
    }

    /* reset code variant */
    if (codeVariantToggle) {
      setActiveToggle(codeVariantToggle, 'data-code-variant-btn', 'dark', 'pos-segmented-control-btn--active');
      var inlineElReset = document.getElementById('comp-code-inline');
      var blockPre = document.getElementById('comp-code-block');
      if (inlineElReset) inlineElReset.classList.add('pos-code--dark');
      if (blockPre) blockPre.classList.remove('pos-code--light');
    }

    /* reset code inline size */
    var codeInlineSizeToggle = document.getElementById('comp-code-inline-size-toggle');
    if (codeInlineSizeToggle) {
      setActiveToggle(codeInlineSizeToggle, 'data-code-inline-size-btn', 'default', 'pos-segmented-control-btn--active');
      var inlineEl = document.getElementById('comp-code-inline');
      if (inlineEl) inlineEl.classList.remove('pos-code--small');
    }

    /* reset link size and token map */
    if (key === 'link') {
      if (stage) {
        stage.querySelectorAll<HTMLElement>('.pos-link').forEach(function (a) { a.classList.remove('pos-link--small'); });
      }
    }

    /* apply icon size defaults when switching to/from control-icons */
    if (key === 'control-icons') {
      state.iconSize = 'm';
      if (iconSizeToggle) {
        setActiveToggle(iconSizeToggle, 'data-icon-size-btn', 'm', 'pos-segmented-control-btn--active');
      }
      /* apply default (M) size to preview icons */
      var ciStageInit = document.querySelector<HTMLElement>('#comp-section-control-icons .comp-preview-stage');
      if (ciStageInit) {
        ciStageInit.querySelectorAll<HTMLElement>('.pos-close, .pos-chevron').forEach(function (el) {
          el.style.fontSize = 'var(--pos-size-icon-m)';
        });
      }
    }

    /* update left nav active item */
    var sidebar = document.querySelector<HTMLElement>('.styleguide-ds-sidebar');
    if (sidebar) {
      sidebar.querySelectorAll<HTMLElement>('.pos-collapsible li').forEach(function (li) {
        var a = li.querySelector<HTMLElement>(':scope > a');
        if (!a) return;
        var hash = (a.getAttribute('href') || '').split('#')[1] || '';
        li.classList.toggle('pos-collapsible-active', hash === 'comp-section-' + key);
      });
    }

    state.lastInspectedEl = null;
    renderUsageTab(key);
    /* Same rule as openTokensPanel(): migrated (spec-driven) components never show the old
       "click an element" hint — every component is spec-driven now (docs/inspect refactor complete
       as of 2026-08-27), so this only needs to refresh real token data, never show a hint. Runs on
       every fresh navigation to a section (not just the first-ever Tokens-tab open), or navigating
       between components while the Tokens panel is already open (e.g. scrolling from one section
       to the next) would leave stale data on screen. */
    if (tokensPanel && tokensPanel.classList.contains('comp-tokens-panel--visible')) {
      renderTokenPanel(state.status, state.size);
    }
    /* code snippet lives under the preview, always visible (no panel-open gate) — refresh it on
       every fresh navigation too, not just after a toggle click (tryRefreshInspect covers that
       case), else it stays empty until the user touches a control. No-ops for non-migrated
       components (renderCodePanel returns early when there's no #comp-preview-code-<key> element
       or no COMPONENT_SPECS entry). */
    renderCodePanel();
  }

  /* Breadcrumb variant (Expanded / Collapsed) — 2026-09-19. Demo-only toggle of the same
     .pos-breadcrumb--collapsed class the real component's ResizeObserver
     (assets/js/pos-breadcrumb.js) applies automatically once the list overflows its container;
     lets the docs preview show the collapsed look without needing to shrink the panel.
     Wired here (not in controls/cards-misc.ts, where every other Complex-components variant
     toggle lives) specifically so it can call switchComponent() directly — importing it into
     cards-misc.ts would be circular, since this file already imports from cards-misc.ts.
     The switchComponent() calls below are a real fix, not caution for its own sake: reproduced
     live (Playwright, real click, real native-click dispatch — ruled out as a test-tool artifact)
     that with the Tokens panel already open (narrower #main-content), toggling this class can
     shift layout enough to fire a genuine native 'scroll' event on #main-content, which the
     shared scroll-sync observer (scroll-nav.ts's syncActiveComponent) reads and can switch the
     right panel to a neighboring section (observed: landed on "Tab"). Re-asserting immediately,
     and again after any such stray scroll has had a chance to fire and settle, wins back
     correctness — the same defensive pattern scrollToSectionHash already uses for a related
     scroll-sync race (see scroll-nav.ts). */
  var breadcrumbVariantToggle = document.getElementById('comp-breadcrumb-variant-toggle');
  registerControl(breadcrumbVariantToggle, '[data-breadcrumb-variant-btn]', function (btn) {
    var variant = btn.dataset.breadcrumbVariantBtn;
    setActiveToggle(breadcrumbVariantToggle, 'data-breadcrumb-variant-btn', variant, 'pos-segmented-control-btn--active');
    var bcEl = document.getElementById('comp-breadcrumb-el');
    if (bcEl) bcEl.classList.toggle('pos-breadcrumb--collapsed', variant === 'collapsed');
    switchComponent('breadcrumb');
    /* scrollend does not reliably fire for this — the stray scroll-position change this class
       toggle can trigger isn't always a genuine animated/programmatic scroll the browser
       considers "an end" of (confirmed empirically: scrollend never fired here even though the
       scroll-sync observer's plain 'scroll' listener did, and mis-fired switchComponent('tab')).
       A short setTimeout re-assertion, after the scroll-sync's own RAF-throttled handler has had
       a chance to run and do whatever damage it's going to do, is the reliable fix. */
    setTimeout(function () { switchComponent('breadcrumb'); }, 50);
  });