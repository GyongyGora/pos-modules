import { state } from './core/state.js';
import { tryRefreshInspect } from './core/refresh-inspect.js';
import { getActivePreviewStage, getPreviewButtons, getPreviewLinks, previewStage } from './preview-stage.js';


  /* loading SVG — loading icon (8-spoke sun), scaled to 1em */
  export var LOADING_SVG = '<svg class="pos-spinner pos-button-loading-icon" width="1em" height="1em" viewBox="2 2 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style="fill:none;overflow:visible" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M12 6l0 -3" />' +
    '<path d="M16.25 7.75l2.15 -2.15" />' +
    '<path d="M18 12l3 0" />' +
    '<path d="M16.25 16.25l2.15 2.15" />' +
    '<path d="M12 18l0 3" />' +
    '<path d="M7.75 16.25l-2.15 2.15" />' +
    '<path d="M6 12l-3 0" />' +
    '<path d="M7.75 7.75l-2.15 -2.15" />' +
    '</svg>';

  export function applyStatus(status: string): void {
    var handler = STATUS_HANDLERS[state.comp];
    if (handler) {
      handler(status);
    } else {
      applyStatus_buttons(status);
    }
    state.status = status;
    tryRefreshInspect();
  }

  /* toast — hover only ever affects the close button (×), which composes the shared .pos-close
     component (pos-close.css) — reuses its own pos-debug-close-hover class (same one Control
     icons uses below) instead of a bespoke toast-only class, so the simulated hover gets the
     real color+scale behavior for free. Only the currently-visible variant row's own close
     button is toggled, not every one, so switching between Success/Error/Info/Warning doesn't
     leak the simulated hover onto a row that isn't shown. */
  export function applyStatus_toast(status: string): void {
    var toastStage = getActivePreviewStage();
    if (toastStage) {
      toastStage.querySelectorAll<HTMLElement>('.pos-toast-close').forEach(function (btn) {
        btn.classList.remove('pos-debug-close-hover');
      });
      var visibleCloseBtn = toastStage.querySelector<HTMLElement>('.comp-preview-variant-row:not([hidden]) .pos-toast-close');
      if (visibleCloseBtn && status === 'hover') {
        visibleCloseBtn.classList.add('pos-debug-close-hover');
      }
      toastStage.dataset.status = status;
    }
  }

  /* dialog — hover/focus only ever affect the close button (×), which composes the shared
     .pos-close component, same debug classes as Control icons below. Only the currently-visible
     variant row's own close button is toggled. */
  export function applyStatus_dialog(status: string): void {
    var dialogStage = getActivePreviewStage();
    if (dialogStage) {
      dialogStage.querySelectorAll<HTMLElement>('.pos-dialog-close').forEach(function (btn) {
        btn.classList.remove('pos-debug-close-hover', 'pos-debug-close-focus');
      });
      var visibleDialogClose = dialogStage.querySelector<HTMLElement>('.comp-preview-variant-row:not([hidden]) .pos-dialog-close');
      if (visibleDialogClose) {
        if (status === 'hover') visibleDialogClose.classList.add('pos-debug-close-hover');
        if (status === 'focus') visibleDialogClose.classList.add('pos-debug-close-focus');
      }
      dialogStage.dataset.status = status;
    }
  }

  /* tab — all 4 states (Normal/Hover/Selected/Disabled) describe ONE isolated demo tab
     (#comp-tab-demo-normal or #comp-tab-demo-detailed, whichever variant row is visible),
     same single-instance model as Button. Selected adds pos-tab--active (this is the "current"
     tab); Disabled is a disabled ACTIVE tab specifically (interactive-*-disabled tokens), not a disabled normal tab. The separate live/interactive tab
     row below it is real, click-driven, and untouched by this toggle (wired in the click
     handler further down). */
  export function applyStatus_tab(status: string): void {
    var tabStage = getActivePreviewStage();
    if (tabStage) {
      var demoTab = tabStage.querySelector<HTMLButtonElement>('.comp-preview-variant-row:not([hidden]) [id^="comp-tab-demo-"]');
      if (demoTab) {
        demoTab.classList.remove('pos-tab--active', 'pos-tab-detailed--active', 'pos-debug-tab-hover', 'pos-debug-tab-detailed-hover', 'pos-debug-tab-focus', 'pos-debug-tab-detailed-focus', 'pos-debug-tab-disabled', 'pos-debug-tab-detailed-disabled');
        demoTab.disabled = false;
        var isDetailedDemo = demoTab.classList.contains('pos-tab-detailed');
        var activeClass = isDetailedDemo ? 'pos-tab-detailed--active' : 'pos-tab--active';
        var hoverClass = isDetailedDemo ? 'pos-debug-tab-detailed-hover' : 'pos-debug-tab-hover';
        var focusClass = isDetailedDemo ? 'pos-debug-tab-detailed-focus' : 'pos-debug-tab-focus';
        var disabledClass = isDetailedDemo ? 'pos-debug-tab-detailed-disabled' : 'pos-debug-tab-disabled';
        if (status === 'hover') demoTab.classList.add(hoverClass);
        if (status === 'focus') demoTab.classList.add(focusClass);
        if (status === 'selected') demoTab.classList.add(activeClass);
        /* plain disabled — looks like Normal, just muted with the disabled tokens, no underline */
        if (status === 'disabled') { demoTab.classList.add(disabledClass); demoTab.disabled = true; }
        /* selected + disabled — the active/selected tab itself disabled, keeps its underline but
           switches to the interactive-*-disabled tokens */
        if (status === 'selected-disabled') { demoTab.classList.add(activeClass, disabledClass); demoTab.disabled = true; }
      }
      tabStage.dataset.status = status;
    }
  }

  /* control icons */
  export function applyStatus_controlIcons(status: string): void {
    var ciStage = getActivePreviewStage();
    if (ciStage) {
      ciStage.querySelectorAll<HTMLElement>('.pos-close, .pos-chevron').forEach(function (el) {
        el.classList.remove('pos-debug-close-hover', 'pos-debug-close-focus',
                            'pos-debug-chevron-hover', 'pos-debug-chevron-focus');
        el.removeAttribute('disabled');
        switch (status) {
          case 'hover':
            el.classList.add(el.classList.contains('pos-close') ? 'pos-debug-close-hover' : 'pos-debug-chevron-hover');
            break;
          case 'focus':
            el.classList.add(el.classList.contains('pos-close') ? 'pos-debug-close-focus' : 'pos-debug-chevron-focus');
            break;
          case 'disabled': el.setAttribute('disabled', ''); break;
        }
      });
      ciStage.dataset.status = status;
    }
  }

  /* segmented control */
  export function applyStatus_segmented(status: string): void {
    var segStage = getActivePreviewStage();
    if (segStage) {
      segStage.querySelectorAll<HTMLElement>('.pos-segmented-control').forEach(function (sc) {
        sc.classList.remove('pos-segmented-control--disabled');
        sc.removeAttribute('aria-disabled');
        sc.querySelectorAll<HTMLElement>('.pos-segmented-control-btn').forEach(function (b) {
          b.removeAttribute('disabled');
        });
        if (status === 'disabled') {
          sc.classList.add('pos-segmented-control--disabled');
          sc.setAttribute('aria-disabled', 'true');
          sc.querySelectorAll<HTMLElement>('.pos-segmented-control-btn').forEach(function (b) {
            b.setAttribute('disabled', '');
          });
        }
      });
      segStage.dataset.status = status;
    }
  }

  /* tile button */
  export function applyStatus_tileBtn(status: string): void {
    var tbStage = getActivePreviewStage();
    if (tbStage) {
      tbStage.querySelectorAll<HTMLElement>('.pos-tile-btn').forEach(function (btn) {
        btn.classList.remove('pos-tile-btn--selected', 'pos-debug-tile-btn-hover', 'pos-debug-tile-btn-focus');
        btn.setAttribute('aria-pressed', 'false');
        btn.removeAttribute('disabled');
        btn.removeAttribute('aria-disabled');
        if (status === 'selected') {
          btn.classList.add('pos-tile-btn--selected');
          btn.setAttribute('aria-pressed', 'true');
        } else if (status === 'hover') {
          btn.classList.add('pos-debug-tile-btn-hover');
        } else if (status === 'focus') {
          btn.classList.add('pos-debug-tile-btn-focus');
        } else if (status === 'disabled') {
          btn.setAttribute('disabled', '');
        } else if (status === 'selected-disabled') {
          btn.classList.add('pos-tile-btn--selected');
          btn.setAttribute('aria-pressed', 'true');
          btn.setAttribute('disabled', '');
        }
      });
      tbStage.dataset.status = status;
    }
  }

  /* switch card */
  export function applyStatus_switchCard(status: string): void {
    var scStage = getActivePreviewStage();
    if (scStage) {
      var scCard  = scStage.querySelector<HTMLElement>('.pos-switch-card');
      var scInput = scStage.querySelector<HTMLInputElement>('.pos-switch-card-input');
      if (scCard && scInput) {
        scCard.classList.remove('pos-debug-switch-card-hover', 'pos-debug-switch-card-focus');
        scInput.checked  = false;
        scInput.disabled = false;
        switch (status) {
          case 'hover':             scCard.classList.add('pos-debug-switch-card-hover'); break;
          case 'focus':             scCard.classList.add('pos-debug-switch-card-focus'); break;
          case 'disabled':          scInput.disabled = true; break;
          case 'selected':          scInput.checked = true; break;
          case 'selected-disabled': scInput.checked = true; scInput.disabled = true; break;
        }
      }
      scStage.dataset.status = status;
    }
  }

  /* tags */
  export function applyStatus_tag(status: string): void {
    var tagStage = getActivePreviewStage();
    if (tagStage) {
      tagStage.querySelectorAll<HTMLElement>('button.pos-tag, a.pos-tag, span.pos-tag').forEach(function (el) {
        el.classList.remove(
          'pos-debug-tag-hover', 'pos-debug-tag-focus',
          'pos-debug-tag-disabled', 'pos-tag-selected'
        );
        el.removeAttribute('aria-disabled');
        switch (status) {
          case 'hover':    el.classList.add('pos-debug-tag-hover');    break;
          case 'focus':    el.classList.add('pos-debug-tag-focus');    break;
          case 'disabled':
            el.classList.add('pos-debug-tag-disabled');
            el.setAttribute('aria-disabled', 'true');
            break;
          case 'selected': el.classList.add('pos-tag-selected');       break;
        }
      });
      tagStage.dataset.status = status;
    }
  }

  /* legacy card */
  export function applyStatus_card(status: string): void {
    var cardEl = document.getElementById('comp-card-el');
    if (cardEl) {
      cardEl.classList.remove('pos-debug-card-hover', 'pos-debug-card-focus');
      switch (status) {
        case 'hover': cardEl.classList.add('pos-debug-card-hover'); break;
        case 'focus': cardEl.classList.add('pos-debug-card-focus'); break;
      }
    }
    var cStage = getActivePreviewStage();
    if (cStage) cStage.dataset.status = status;
  }

  /* avatar */
  export function applyStatus_avatar(status: string): void {
    var avatarStage = document.getElementById('comp-section-avatar');
    if (avatarStage) {
      avatarStage.querySelectorAll<HTMLElement>('.pos-avatar').forEach(function (av) {
        av.classList.remove('pos-debug-avatar-hover');
        if (status === 'hover') av.classList.add('pos-debug-avatar-hover');
      });
    }
    var avStage = getActivePreviewStage();
    if (avStage) avStage.dataset.status = status;
  }

  /* feature card */
  export function applyStatus_featureCard(status: string): void {
    var fcStage = document.getElementById('comp-feature-card-preview');
    if (fcStage) {
      fcStage.querySelectorAll<HTMLElement>('.pos-feature-card').forEach(function (fc) {
        fc.classList.remove('pos-debug-feature-card-hover');
        if (status === 'hover') fc.classList.add('pos-debug-feature-card-hover');
      });
      fcStage.dataset.status = status;
    }
  }

  /* links */
  export function applyStatus_link(status: string): void {
    getPreviewLinks().forEach(function (a) {
      a.classList.remove('pos-debug-link-hover', 'pos-debug-link-active', 'pos-debug-link-focus', 'pos-debug-link-disabled', 'pos-debug-link-visited');
      switch (status) {
        case 'hover':    a.classList.add('pos-debug-link-hover');     break;
        case 'active':   a.classList.add('pos-debug-link-active');    break;
        case 'focus':    a.classList.add('pos-debug-link-focus');     break;
        case 'disabled': a.classList.add('pos-debug-link-disabled'); break;
        case 'visited':  a.classList.add('pos-debug-link-visited');  break;
      }
    });
    var linkStage = getActivePreviewStage();
    if (linkStage) linkStage.dataset.status = status;
  }

  /* radio */
  export function applyStatus_radio(status: string): void {
    var radioStage = getActivePreviewStage();
    if (radioStage) {
      radioStage.querySelectorAll<HTMLInputElement>('[type="radio"]').forEach(function (el) {
        el.classList.remove('pos-debug-radio-focus-visible', 'pos-debug-radio-hover');
        el.disabled = false;
        el.checked = false;
        switch (status) {
          case 'hover':             el.classList.add('pos-debug-radio-hover'); break;
          case 'focus':             el.classList.add('pos-debug-radio-focus-visible'); break;
          case 'selected':          el.checked = true; break;
          case 'disabled':          el.disabled = true; break;
          case 'selected-disabled': el.checked = true; el.disabled = true; break;
        }
      });
      radioStage.dataset.status = status;
    }
  }

  /* checkbox */
  export function applyStatus_checkbox(status: string): void {
    var cbStage = getActivePreviewStage();
    if (cbStage) {
      cbStage.querySelectorAll<HTMLInputElement>('[type="checkbox"]').forEach(function (el) {
        el.classList.remove('pos-debug-checkbox-focus-visible', 'pos-debug-checkbox-hover');
        el.disabled = false;
        el.checked = false;
        switch (status) {
          case 'hover':             el.classList.add('pos-debug-checkbox-hover'); break;
          case 'focus':             el.classList.add('pos-debug-checkbox-focus-visible'); break;
          case 'selected':          el.checked = true; break;
          case 'disabled':          el.disabled = true; break;
          case 'selected-disabled': el.checked = true; el.disabled = true; break;
        }
      });
      cbStage.dataset.status = status;
    }
  }

  /* text input */
  export function applyStatus_textInput(status: string): void {
    var tiStage = getActivePreviewStage();
    if (tiStage) {
      var tiInputs = tiStage.querySelectorAll<HTMLInputElement>('.pos-form-input');
      var tiEmailInput = tiStage.querySelector<HTMLInputElement>('#comp-text-input-field');
      var tiDateInput  = tiStage.querySelector<HTMLInputElement>('#comp-text-input-date');
      tiInputs.forEach(function (inp) {
        inp.classList.remove('pos-debug-form-input-hover', 'pos-debug-form-input-focus-visible', 'pos-debug-form-input-filled');
        inp.disabled = false;
        inp.removeAttribute('readonly');
        if (inp.type !== 'select-one') inp.value = '';
      });
      switch (status) {
        case 'hover':
          tiInputs.forEach(function (inp) { inp.classList.add('pos-debug-form-input-hover'); });
          break;
        case 'focus':
          tiInputs.forEach(function (inp) { inp.classList.add('pos-debug-form-input-focus-visible'); });
          break;
        case 'filled':
          if (tiEmailInput) tiEmailInput.value = 'email@domain.com';
          if (tiDateInput)  tiDateInput.value  = '2024-03-15';
          break;
        case 'disabled':
          tiInputs.forEach(function (inp) { inp.disabled = true; });
          break;
        case 'display-only':
          if (tiEmailInput) { tiEmailInput.setAttribute('readonly', ''); tiEmailInput.value = '32fgs84-7044-4c57'; }
          if (tiDateInput)  { tiDateInput.setAttribute('readonly', '');  tiDateInput.value  = '2024-03-15'; }
          break;
      }
      tiStage.dataset.status = status;
    }
  }

  /* textarea */
  export function applyStatus_textarea(status: string): void {
    var taStage = getActivePreviewStage();
    if (taStage) {
      var taInput = taStage.querySelector<HTMLTextAreaElement>('.pos-form-input');
      if (taInput) {
        taInput.classList.remove('pos-debug-form-input-hover', 'pos-debug-form-input-focus-visible');
        taInput.disabled = false;
        taInput.removeAttribute('readonly');
        taInput.value = '';
        switch (status) {
          case 'hover':        taInput.classList.add('pos-debug-form-input-hover'); break;
          case 'focus':        taInput.classList.add('pos-debug-form-input-focus-visible'); break;
          case 'filled':       taInput.value = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'; break;
          case 'disabled':     taInput.disabled = true; break;
          case 'display-only': taInput.setAttribute('readonly', ''); taInput.value = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'; break;
        }
      }
      taStage.dataset.status = status;
    }
  }

  /* select */
  export function applyStatus_select(status: string): void {
    var selStage = getActivePreviewStage();
    if (selStage) {
      var selInput = selStage.querySelector<HTMLSelectElement>('select');
      if (selInput) {
        selInput.classList.remove('pos-debug-form-input-hover', 'pos-debug-form-input-focus-visible', 'pos-debug-form-input-opened', 'pos-debug-form-input-filled');
        selInput.disabled = false;
        selInput.removeAttribute('readonly');
        selInput.selectedIndex = 0;
        switch (status) {
          case 'closed':   break;
          case 'hover':    selInput.classList.add('pos-debug-form-input-hover'); break;
          case 'focus':    selInput.classList.add('pos-debug-form-input-focus-visible'); break;
          case 'opened':
            /* separate class from 'focus' — only 'opened' flips the chevron up */
            selInput.classList.add('pos-debug-form-input-focus-visible', 'pos-debug-form-input-opened');
            selInput.focus();
            if (typeof selInput.showPicker === 'function') {
              try { selInput.showPicker(); } catch (e) { /* not supported in this browser */ }
            }
            break;
          case 'filled':   selInput.selectedIndex = 1; selInput.classList.add('pos-debug-form-input-filled'); break;
          case 'disabled': selInput.disabled = true; break;
        }
      }
      selStage.dataset.status = status;
    }
  }

  /* multiselect — only the "Filled" state shows selected tags (Option A + B);
     every other state (Closed/Hover/Focus/Opened/Disabled) shows the empty,
     placeholder-only look. Drives the real pos.modules.multiselect instance
     so the tag list and checkboxes stay in sync, same as switchComponent's
     reset block does. */
  export function applyStatus_multiselect(status: string): void {
    var msStage = getActivePreviewStage();
    if (msStage) {
      var msEl    = msStage.querySelector<HTMLElement>('.pos-form-multiselect');
      var msInput = msStage.querySelector<HTMLElement>('.pos-form-multiselect-input');
      if (msEl) {
        msEl.classList.remove('pos-form-multiselect-opened', 'pos-debug-multiselect-disabled');
      }
      if (msInput) {
        msInput.classList.remove('pos-debug-form-input-focus-visible', 'pos-debug-form-input-hover');
        msInput.removeAttribute('aria-disabled');
        msInput.setAttribute('tabindex', '0');
      }
      var msModule = window.pos.modules.active && window.pos.modules.active['comp-multiselect-field'];
      if (msModule) {
        msModule.clear();
        if (status === 'filled') {
          ['a', 'b'].forEach(function (value) {
            var chk = msStage.querySelector<HTMLInputElement>('.pos-form-multiselect-list [value="' + value + '"]');
            if (chk) { chk.checked = true; }
            msModule.add(value);
          });
        }
      }
      switch (status) {
        case 'hover':  if (msInput) msInput.classList.add('pos-debug-form-input-hover'); break;
        case 'focus':  if (msInput) msInput.classList.add('pos-debug-form-input-focus-visible'); break;
        case 'opened': if (msEl) msEl.classList.add('pos-form-multiselect-opened'); break;
        case 'disabled':
          if (msEl) msEl.classList.add('pos-debug-multiselect-disabled');
          if (msInput) { msInput.setAttribute('aria-disabled', 'true'); msInput.setAttribute('tabindex', '-1'); }
          break;
      }
      msStage.dataset.status = status;
    }
  }

  /* password */
  export function applyStatus_password(status: string): void {
    var pwStage = getActivePreviewStage();
    if (pwStage) {
      var pwContainer = pwStage.querySelector<HTMLElement>('.pos-form-password');
      var pwInput     = pwStage.querySelector<HTMLInputElement>('.pos-form-password input[type]');
      if (pwInput) {
        pwInput.classList.remove('pos-debug-form-input-hover', 'pos-debug-form-input-focus-visible');
        pwInput.disabled = false;
        pwInput.setAttribute('type', 'password');
      }
      if (pwContainer) pwContainer.classList.remove('pos-form-password-shown');
      switch (status) {
        case 'hover':    if (pwInput) pwInput.classList.add('pos-debug-form-input-hover'); break;
        case 'focus':    if (pwInput) pwInput.classList.add('pos-debug-form-input-focus-visible'); break;
        case 'active':
          if (pwContainer) pwContainer.classList.add('pos-form-password-shown');
          // needs real content for the "revealed" dots to render dark/bold,
          // same as any other filled input — an empty field has nothing to reveal
          if (pwInput) {
            if (!pwInput.value) pwInput.value = 'SecurePass123';
            pwInput.setAttribute('type', 'text');
          }
          break;
        case 'disabled': if (pwInput) pwInput.disabled = true; break;
      }
      pwStage.dataset.status = status;
    }
  }

  /* popover */
  export function applyStatus_popover(status: string): void {
    var popoverStage = getActivePreviewStage();
    if (popoverStage) {
      popoverStage.querySelectorAll<HTMLElement>('menu li a, menu li button').forEach(function (el) {
        el.classList.remove('pos-debug-popover-item-hover', 'pos-debug-popover-item-selected');
        if (status === 'hover')    el.classList.add('pos-debug-popover-item-hover');
        if (status === 'selected') el.classList.add('pos-debug-popover-item-selected');
      });
      popoverStage.dataset.status = status;
    }
  }

  /* buttons — the default handler for any component with no dedicated status-simulation
     logic above (e.g. plain Button): toggles the shared debug classes on every visible
     preview button, including the loading-content swap. */
  export function applyStatus_buttons(status: string): void {
    getPreviewButtons().forEach(function (btn) {
      /* restore loading content before any state change */
      if (btn.dataset.originalHtml !== undefined) {
        btn.innerHTML = btn.dataset.originalHtml;
        delete btn.dataset.originalHtml;
      }

      btn.classList.remove(
        'pos-debug-button-hover',
        'pos-debug-button-active',
        'pos-debug-button-focus-visible',
        'pos-button--loading'
      );
      btn.removeAttribute('disabled');
      btn.removeAttribute('aria-disabled');

      switch (status) {
        case 'hover':    btn.classList.add('pos-debug-button-hover');          break;
        case 'active':   btn.classList.add('pos-debug-button-active');         break;
        case 'focus':    btn.classList.add('pos-debug-button-focus-visible');  break;
        case 'disabled': btn.setAttribute('disabled', '');                     break;
        case 'loading':
          btn.dataset.originalHtml = btn.innerHTML;
          btn.classList.add('pos-button--loading');
          btn.setAttribute('aria-disabled', 'true');
          /* detect button type and inject appropriate loading content */
          var isIconOnly = btn.classList.contains('pos-button--icon-only');
          var btnSvg     = btn.querySelector<HTMLElement>('svg');
          if (isIconOnly) {
            /* icon-only: spinner + visually-hidden label */
            btn.innerHTML = LOADING_SVG + '<span class="pos-label">Loading</span>';
          } else if (btnSvg) {
            /* has icon: replace icon with spinner, preserve position */
            var svgIsFirst = btn.firstElementChild && btn.firstElementChild.tagName.toLowerCase() === 'svg';
            btn.innerHTML = svgIsFirst
              ? LOADING_SVG + ' Loading'       /* icon was on the left */
              : 'Loading ' + LOADING_SVG;      /* icon was on the right */
          } else {
            /* text-only: animated dots */
            btn.innerHTML = '<span class="pos-button-loading-text">Loading</span>';
          }
          break;
      }
    });
    previewStage.dataset.status = status;
  }

  /* breadcrumb — generated by scripts/generate-component.js */
  export function applyStatus_breadcrumb(status: string): void {
    var breadcrumbStage = getActivePreviewStage();
    if (breadcrumbStage) {
      breadcrumbStage.querySelectorAll<HTMLElement>('.pos-breadcrumb').forEach(function (el) {
        el.classList.remove('pos-debug-breadcrumb-hover', 'pos-debug-breadcrumb-focus');
        el.removeAttribute('disabled');
        switch (status) {
          case 'hover': el.classList.add('pos-debug-breadcrumb-hover'); break;
          case 'focus': el.classList.add('pos-debug-breadcrumb-focus'); break;
        }
      });
      breadcrumbStage.dataset.status = status;
    }
  }
  /* slider — generated by scripts/generate-component.js */
  export function applyStatus_slider(status: string): void {
    var sliderStage = getActivePreviewStage();
    if (sliderStage) {
      sliderStage.querySelectorAll<HTMLElement>('.pos-slider').forEach(function (el) {
        el.classList.remove('pos-debug-slider-focus');
        el.removeAttribute('disabled');
        switch (status) {
          case 'focus': el.classList.add('pos-debug-slider-focus'); break;
        }
      });
      sliderStage.dataset.status = status;
    }
  }
  /* dropdown-button — generated by scripts/generate-component.js; the trigger is a real
     .pos-button, so hover / focus reuse the Button's own debug classes, disabled is the trigger's
     attribute, and active (= open) is the wrapper's debug class that shows the menu statically */
  export function applyStatus_dropdownButton(status: string): void {
    var dropdown_buttonStage = getActivePreviewStage();
    if (dropdown_buttonStage) {
      dropdown_buttonStage.querySelectorAll<HTMLElement>('.pos-dropdown-button').forEach(function (el) {
        var trigger = el.querySelector<HTMLElement>('.pos-dropdown-button-trigger');
        el.classList.remove('pos-debug-dropdown-button-active', 'pos-dropdown-button--flush');
        if (trigger) {
          trigger.classList.remove('pos-debug-button-hover', 'pos-debug-button-focus-visible');
          trigger.removeAttribute('disabled');
        }
        switch (status) {
          case 'hover': if (trigger) trigger.classList.add('pos-debug-button-hover'); break;
          case 'focus': if (trigger) trigger.classList.add('pos-debug-button-focus-visible'); break;
          case 'active': {
            el.classList.add('pos-debug-dropdown-button-active');
            /* the static menu: square its far corner when it is exactly as wide as the trigger,
               as the Popover module does for the real one */
            var menu = el.querySelector<HTMLElement>('.pos-dropdown-button-menu');
            if (menu && trigger) el.classList.toggle('pos-dropdown-button--flush', Math.abs(menu.getBoundingClientRect().width - trigger.getBoundingClientRect().width) < 1);
            break;
          }
          case 'disabled': if (trigger) trigger.setAttribute('disabled', ''); break;
        }
      });
      dropdown_buttonStage.dataset.status = status;
    }
  }
  /* number selector — the real partial on the stage; hover / focus are simulated with debug
     classes, filled / disabled / display only are real (value, disabled, readonly). After each
     change the component's own module (pos-number-selector.js, registered under the input id)
     syncs the stepper buttons and the filled class. */
  export function applyStatus_numberSelector(status: string): void {
    var nsStage = getActivePreviewStage();
    if (nsStage) {
      nsStage.querySelectorAll<HTMLElement>('.pos-number-selector').forEach(function (el) {
        var input = el.querySelector<HTMLInputElement>('.pos-number-selector-input');
        el.classList.remove('pos-debug-number-selector-hover', 'pos-debug-number-selector-focus');
        if (!input) return;
        input.disabled = false;
        input.removeAttribute('readonly');
        input.value = input.dataset.start || input.defaultValue;
        switch (status) {
          case 'hover': el.classList.add('pos-debug-number-selector-hover'); break;
          case 'focus': el.classList.add('pos-debug-number-selector-focus'); break;
          case 'filled': input.value = String(Number(input.defaultValue) + 1); break;
          case 'disabled': input.disabled = true; break;
          case 'display-only': input.setAttribute('readonly', ''); break;
        }
        var nsModule = window.pos && window.pos.modules && window.pos.modules.active && window.pos.modules.active[input.id];
        if (nsModule && nsModule.update) nsModule.update();
      });
      nsStage.dataset.status = status;
    }
  }
  export var STATUS_HANDLERS: Record<string, (status: string) => void> = {
    'toast': applyStatus_toast,
    'dialog': applyStatus_dialog,
    'tab': applyStatus_tab,
    'control-icons': applyStatus_controlIcons,
    'segmented': applyStatus_segmented,
    'tile-btn': applyStatus_tileBtn,
    'switch-card': applyStatus_switchCard,
    'tag': applyStatus_tag,
    'card': applyStatus_card,
    'avatar': applyStatus_avatar,
    'feature-card': applyStatus_featureCard,
    'link': applyStatus_link,
    'radio': applyStatus_radio,
    'checkbox': applyStatus_checkbox,
    'text-input': applyStatus_textInput,
    'textarea': applyStatus_textarea,
    'select': applyStatus_select,
    'multiselect': applyStatus_multiselect,
    'password': applyStatus_password,
    'popover': applyStatus_popover,
    'breadcrumb': applyStatus_breadcrumb,
    'slider': applyStatus_slider,
    'dropdown-button': applyStatus_dropdownButton,
    'number-selector': applyStatus_numberSelector,
  };