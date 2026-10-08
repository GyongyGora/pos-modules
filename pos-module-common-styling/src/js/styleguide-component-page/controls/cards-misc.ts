import { statusGrid } from './status-size-scheme.js';
import { registerControl, setActiveToggle } from '../core/dom-utils.js';
import { tryRefreshInspect } from '../core/refresh-inspect.js';
import { CHIP_INTENT_CLASSES } from '../comp-configs.js';
import { getActivePreviewStage } from '../preview-stage.js';



  /* Tag's "Default" kind has no hover/focus/disabled/selected states in the
     spec (only `normal`) — disable the shared status buttons for the other
     states so they can't be clicked into a state Tag Default doesn't have. */
  export function setTagStateButtonsForKind(kind: string) {
    if (!statusGrid) return;
    var isDefault = kind === 'default';
    statusGrid.querySelectorAll<HTMLButtonElement>('[data-status-btn]').forEach(function (b) {
      var isNormal = b.dataset.statusBtn === 'normal';
      b.disabled = isDefault && !isNormal;
    });
  }

  export var cardSizeToggle = document.getElementById('comp-feature-card-size-toggle');
  registerControl(cardSizeToggle, '[data-card-size-btn]', function (btn) {
    var size = btn.dataset.cardSizeBtn;
    setActiveToggle(cardSizeToggle, 'data-card-size-btn', size, 'pos-segmented-control-btn--active');
    var preview = document.getElementById('comp-feature-card-preview');
    if (preview) {
      preview.querySelectorAll<HTMLElement>('.pos-feature-card').forEach(function (card) {
        card.classList.toggle('pos-feature-card--small', size === 'small');
        card.classList.toggle('pos-feature-card--large', size === 'large');
        card.querySelectorAll<HTMLElement>('.pos-feature-card-actions .pos-button').forEach(function (btn) {
          btn.classList.toggle('pos-button-small', size === 'small');
        });
      });
    }
    var badgeEl = document.getElementById('comp-feature-card-el-badge');
    if (badgeEl) {
      badgeEl.classList.toggle('pos-tag--small', size === 'small');
    }
    tryRefreshInspect();
  });

  export var cardVariantToggle = document.getElementById('comp-feature-card-variant-toggle');
  registerControl(cardVariantToggle, '[data-card-variant-btn]', function (btn) {
    var variant = btn.dataset.cardVariantBtn;
    setActiveToggle(cardVariantToggle, 'data-card-variant-btn', variant, 'pos-segmented-control-btn--active');
    var preview = document.getElementById('comp-feature-card-preview');
    if (preview) {
      preview.querySelectorAll<HTMLElement>('.pos-feature-card').forEach(function (card) {
        card.classList.toggle('pos-debug-feature-card-centered', variant === 'centered');
      });
    }
    var badgeSwitch = document.getElementById('comp-fc-badge-switch');
    var badgeInput  = document.getElementById('comp-fc-opt-badge') as HTMLInputElement | null;
    var badgeEl     = document.getElementById('comp-feature-card-el-badge');
    if (variant === 'centered') {
      if (badgeEl) badgeEl.style.display = 'none';
      if (badgeSwitch) { badgeSwitch.style.opacity = '0.4'; badgeSwitch.style.pointerEvents = 'none'; }
    } else {
      if (badgeEl && badgeInput) badgeEl.style.display = badgeInput.checked ? '' : 'none';
      if (badgeSwitch) { badgeSwitch.style.opacity = ''; badgeSwitch.style.pointerEvents = ''; }
    }
    tryRefreshInspect();
  });

  /* background (Default / Highlighted / Brand primary / Brand supplementary) — one modifier class at most */
  export var featureCardBgToggle = document.getElementById('comp-feature-card-bg-toggle');
  registerControl(featureCardBgToggle, '[data-feature-card-bg-btn]', function (btn) {
    var bg = btn.dataset.featureCardBgBtn;
    setActiveToggle(featureCardBgToggle, 'data-feature-card-bg-btn', bg, 'pos-tile-btn--selected');
    var preview = document.getElementById('comp-feature-card-preview');
    if (preview) {
      preview.querySelectorAll<HTMLElement>('.pos-feature-card').forEach(function (card) {
        ['highlighted', 'brand-primary', 'brand-supplementary'].forEach(function (b) { card.classList.toggle('pos-feature-card--' + b, bg === b); });
      });
    }
    tryRefreshInspect();
  });

  export var cardOptEls: Record<string, string> = {
    icon:     'comp-feature-card-el-icon',
    subtitle: 'comp-feature-card-el-subtitle',
    lead:     'comp-feature-card-el-lead',
    link:     'comp-feature-card-el-link',
    buttons:  'comp-feature-card-el-actions',
    badge:    'comp-feature-card-el-badge'
  };
  export var cardOptionsList = document.getElementById('comp-feature-card-options-list');
  if (cardOptionsList) {
    cardOptionsList.addEventListener('change', function (e) {
      var input = (e.target as HTMLElement).closest<HTMLInputElement>('input[type="checkbox"]');
      if (!input) return;
      var item = input.closest<HTMLElement>('[data-card-opt-btn]');
      var opt = item ? item.dataset.cardOptBtn : null;
      var on = input.checked;
      var elId = cardOptEls[opt];
      var el = elId && document.getElementById(elId);
      if (el) el.style.display = on ? '' : 'none';
      tryRefreshInspect();
    });
  }

  export var toastOptionsList = document.getElementById('comp-toast-options-list');
  if (toastOptionsList) {
    toastOptionsList.addEventListener('change', function (e) {
      var input = (e.target as HTMLElement).closest<HTMLInputElement>('input[type="checkbox"]');
      if (!input) return;
      var item = input.closest<HTMLElement>('[data-toast-opt-btn]');
      var opt = item ? item.dataset.toastOptBtn : null;
      if (opt !== 'icon') return;
      var on = input.checked;
      var stage = document.getElementById('comp-toast-preview');
      if (stage) {
        stage.querySelectorAll<HTMLElement>('.pos-toast-container').forEach(function (row) {
          row.classList.toggle('pos-toast-has-icon', on);
        });
      }
      tryRefreshInspect();
    });
  }

  export var alertCardOptionsList = document.getElementById('comp-alert-card-options-list');
  if (alertCardOptionsList) {
    alertCardOptionsList.addEventListener('change', function (e) {
      var input = (e.target as HTMLElement).closest<HTMLInputElement>('input[type="checkbox"]');
      if (!input) return;
      var item = input.closest<HTMLElement>('[data-alert-card-opt-btn]');
      var opt = item ? item.dataset.alertCardOptBtn : null;
      var on = input.checked;
      var stage = document.getElementById('comp-alert-card-preview');
      if (stage) {
        if (opt === 'icon') {
          stage.querySelectorAll<HTMLElement>('.pos-card-alert').forEach(function (card) {
            card.classList.toggle('pos-card-alert--icon-hidden', !on);
          });
        } else if (opt === 'buttons') {
          stage.querySelectorAll<HTMLElement>('.pos-card-alert').forEach(function (card) {
            card.classList.toggle('pos-card-alert--actions-hidden', !on);
          });
        }
      }
      tryRefreshInspect();
    });
  }

  export var chipIntentList = document.getElementById('comp-chip-intent-list');
  registerControl(chipIntentList, '[data-chip-intent-btn]', function (btn) {
    var intent = btn.dataset.chipIntentBtn;
    setActiveToggle(chipIntentList, 'data-chip-intent-btn', intent, 'pos-tile-btn--selected');
    var chipNormal   = document.getElementById('comp-chip-normal');
    var chipProminent = document.getElementById('comp-chip-prominent');
    [chipNormal, chipProminent].forEach(function (chip) {
      if (!chip) return;
      chip.classList.remove.apply(chip.classList, CHIP_INTENT_CLASSES);
      chip.classList.add('pos-chip-' + intent);
    });
    tryRefreshInspect();
  });

  /* Chip variant (Normal / Prominent) — new toggle, 2026-08-26 (docs/inspect refactor, component
     migration batch). Filters the preview to one row at a time, same B2 pattern as Button's Base
     toggle — see getChipVariantSections in the Tokens-panel section below, which reads the result
     of this filtering directly off the DOM rather than a separate tracked state var. */
  export var chipVariantToggle = document.getElementById('comp-chip-variant-toggle');
  registerControl(chipVariantToggle, '[data-chip-variant-btn]', function (btn) {
    var variant = btn.dataset.chipVariantBtn;
    setActiveToggle(chipVariantToggle, 'data-chip-variant-btn', variant, 'pos-segmented-control-btn--active');
    var stage = document.getElementById('comp-chip-preview');
    if (stage) {
      stage.querySelectorAll<HTMLElement>('.comp-preview-variant-row[data-variant]').forEach(function (row) {
        row.hidden = row.dataset.variant !== variant;
      });
    }
  });

  /* Alert card (legacy) variant (Default / Warning / Error / Success) — 2026-09-01, same pattern
     as Chip's above. Restores a component whose usage content was drafted but never wired up
     (no spec JSON, no preview, no nav entry). */
  export var alertCardVariantToggle = document.getElementById('comp-alert-card-variant-toggle');
  registerControl(alertCardVariantToggle, '[data-alert-card-variant-btn]', function (btn) {
    var variant = btn.dataset.alertCardVariantBtn;
    setActiveToggle(alertCardVariantToggle, 'data-alert-card-variant-btn', variant, 'pos-tile-btn--selected');
    var stage = document.getElementById('comp-alert-card-preview');
    if (stage) {
      stage.querySelectorAll<HTMLElement>('.comp-preview-variant-row[data-variant]').forEach(function (row) {
        row.hidden = row.dataset.variant !== variant;
      });
    }
  });

  /* Toast variant (Success / Error / Info) — 2026-09-03, same pattern as Alert card above. */
  export var toastVariantToggle = document.getElementById('comp-toast-variant-toggle');
  registerControl(toastVariantToggle, '[data-toast-variant-btn]', function (btn) {
    var variant = btn.dataset.toastVariantBtn;
    setActiveToggle(toastVariantToggle, 'data-toast-variant-btn', variant, 'pos-tile-btn--selected');
    var stage = document.getElementById('comp-toast-preview');
    if (stage) {
      stage.querySelectorAll<HTMLElement>('.comp-preview-variant-row[data-variant]').forEach(function (row) {
        row.hidden = row.dataset.variant !== variant;
      });
    }
  });

  /* Toggle button state (Off / On / Off disabled / On disabled) — 2026-09-04. */
  export var toggleBtnStateToggle = document.getElementById('comp-toggle-btn-state-toggle');
  registerControl(toggleBtnStateToggle, '[data-toggle-btn-state-btn]', function (btn) {
    var state = btn.dataset.toggleBtnStateBtn;
    setActiveToggle(toggleBtnStateToggle, 'data-toggle-btn-state-btn', state, 'pos-tile-btn--selected');
    var stage = document.getElementById('comp-toggle-btn-preview');
    if (stage) {
      stage.querySelectorAll<HTMLElement>('.comp-preview-variant-row[data-variant]').forEach(function (row) {
        row.hidden = row.dataset.variant !== state;
      });
    }
    tryRefreshInspect();
  });

  /* Tab variant (Simple / Overflow / Detailed) — 2026-09-04. Layout-only, no tokens change
     between variants beyond what's already shown, see getTabVariantSections. */
  export var tabVariantToggle = document.getElementById('comp-tab-variant-toggle');
  registerControl(tabVariantToggle, '[data-tab-variant-btn]', function (btn) {
    var variant = btn.dataset.tabVariantBtn;
    setActiveToggle(tabVariantToggle, 'data-tab-variant-btn', variant, 'pos-segmented-control-btn--active');
    var stage = document.getElementById('comp-tab-preview');
    if (stage) {
      stage.querySelectorAll<HTMLElement>('.comp-preview-variant-row[data-variant]').forEach(function (row) {
        row.hidden = row.dataset.variant !== variant;
      });
    }
    tryRefreshInspect();
  });

  /* Tab — live, fully interactive example rows (#comp-tab-live-normal / #comp-tab-live-detailed),
     independent of the State toggle: clicking any (non-overflow-trigger) tab in either row makes
     it the active one, real click-to-switch behavior, not a docs-only simulation. */
  ['comp-tab-live-normal', 'comp-tab-live-detailed'].forEach(function (id) {
    var liveRow = document.getElementById(id);
    if (!liveRow) return;
    var activeClass = id === 'comp-tab-live-detailed' ? 'pos-tab-detailed--active' : 'pos-tab--active';
    var itemSelector = id === 'comp-tab-live-detailed' ? '.pos-tab-detailed' : '.pos-tab:not(.pos-tabs-overflow)';
    liveRow.addEventListener('click', function (e) {
      var item = (e.target as HTMLElement).closest(itemSelector);
      if (!item || !liveRow.contains(item)) return;
      liveRow.querySelectorAll<HTMLElement>(itemSelector).forEach(function (el) {
        el.classList.toggle(activeClass, el === item);
        if (el === item) el.setAttribute('aria-current', 'page');
        else el.removeAttribute('aria-current');
      });
    });
  });

  /* Table variant (Default / Card) — 2026-09-04. Layout-only variant (which tokens apply differs,
     see getTableVariantSections), no real DOM structure change needed beyond which row is shown. */
  export var tableVariantToggle = document.getElementById('comp-table-variant-toggle');
  registerControl(tableVariantToggle, '[data-table-variant-btn]', function (btn) {
    var variant = btn.dataset.tableVariantBtn;
    setActiveToggle(tableVariantToggle, 'data-table-variant-btn', variant, 'pos-segmented-control-btn--active');
    var stage = document.getElementById('comp-table-preview');
    if (stage) {
      stage.querySelectorAll<HTMLElement>('.comp-preview-variant-row[data-variant]').forEach(function (row) {
        row.hidden = row.dataset.variant !== variant;
      });
    }
  });

  /* Dialog variant (Default / Simple) — 2026-09-04. Layout-only variant, no token differences,
     so this only swaps which preview row is visible (getDialogVariantSections ignores it and
     always returns the same single token set). */
  export var dialogVariantToggle = document.getElementById('comp-dialog-variant-toggle');
  registerControl(dialogVariantToggle, '[data-dialog-variant-btn]', function (btn) {
    var variant = btn.dataset.dialogVariantBtn;
    setActiveToggle(dialogVariantToggle, 'data-dialog-variant-btn', variant, 'pos-segmented-control-btn--active');
    var stage = document.getElementById('comp-dialog-preview');
    if (stage) {
      stage.querySelectorAll<HTMLElement>('.comp-preview-variant-row[data-variant]').forEach(function (row) {
        row.hidden = row.dataset.variant !== variant;
      });
    }
  });

  /* Segmented control variant (Default / Highlighted / Subtle) — new toggle, 2026-08-26. Same
     pattern as Chip's above. */
  export var segmentedVariantToggle = document.getElementById('comp-segmented-variant-toggle');
  registerControl(segmentedVariantToggle, '[data-segmented-variant-btn]', function (btn) {
    var variant = btn.dataset.segmentedVariantBtn;
    setActiveToggle(segmentedVariantToggle, 'data-segmented-variant-btn', variant, 'pos-segmented-control-btn--active');
    var stage = getActivePreviewStage();
    if (stage) {
      stage.querySelectorAll<HTMLElement>('.comp-preview-variant-row[data-variant]').forEach(function (row) {
        row.hidden = row.dataset.variant !== variant;
      });
      /* pos.modules.segmentedControl auto-initializes every .pos-segmented-control on
         DOMContentLoaded — including the 2 rows that start `hidden` behind this toggle. A hidden
         element's getBoundingClientRect() is zero-sized, so the sliding indicator it computed at
         that time is zero-width/mispositioned, and since it also added the --js class (which makes
         the button's own background-color transparent, relying entirely on that indicator to show
         the active color — see pos-segmented-control.css's "when JS is active" rule), the row looks
         like it has no active-state color at all the first time it's revealed. Re-initializing now
         that the row is actually visible gives it a correct measurement. (Re-creates the click
         binding too — harmless here, the click handler is idempotent and this is a docs demo, not
         a production integration.) */
      var revealedControl = stage.querySelector<HTMLElement>('.comp-preview-variant-row[data-variant="' + variant + '"] .pos-segmented-control');
      if (revealedControl && window.pos && window.pos.modules && window.pos.modules.segmentedControl) {
        new window.pos.modules.segmentedControl(revealedControl);
      }
    }
  });

  /* Tag kind (Default / Interactive) — new toggle, 2026-08-26. Same pattern as Chip's above. */
  export var tagKindToggle = document.getElementById('comp-tag-kind-toggle');
  registerControl(tagKindToggle, '[data-tag-kind-btn]', function (btn) {
    var kind = btn.dataset.tagKindBtn;
    setActiveToggle(tagKindToggle, 'data-tag-kind-btn', kind, 'pos-segmented-control-btn--active');
    var stage = document.getElementById('comp-tag-preview');
    if (stage) {
      stage.querySelectorAll<HTMLElement>('.comp-preview-variant-row[data-variant]').forEach(function (row) {
        row.hidden = row.dataset.variant !== kind;
      });
    }

    setTagStateButtonsForKind(kind);
    if (kind === 'default' && statusGrid) {
      var normalBtn = statusGrid.querySelector<HTMLElement>('[data-status-btn="normal"]');
      if (normalBtn && !normalBtn.classList.contains('pos-tile-btn--selected')) {
        normalBtn.click();
      }
    }
  });

  /* Control icons kind (Close / Chevron) — migrated 2026-08-27, same B2 pattern as the others. */
  export var controlIconsKindToggle = document.getElementById('comp-control-icons-kind-toggle');
  registerControl(controlIconsKindToggle, '[data-control-icons-kind-btn]', function (btn) {
    var kind = btn.dataset.controlIconsKindBtn;
    setActiveToggle(controlIconsKindToggle, 'data-control-icons-kind-btn', kind, 'pos-segmented-control-btn--active');
    var stage = document.getElementById('comp-control-icons-preview');
    if (stage) {
      stage.querySelectorAll<HTMLElement>('.comp-preview-variant-row[data-variant]').forEach(function (row) {
        row.hidden = row.dataset.variant !== kind;
      });
    }
  });

  export function updateLegacyCardFooter() {
    var catOn  = document.getElementById('comp-card-opt-category') && (document.getElementById('comp-card-opt-category') as HTMLInputElement).checked;
    var rtOn   = document.getElementById('comp-card-opt-readtime')  && (document.getElementById('comp-card-opt-readtime') as HTMLInputElement).checked;
    var dateOn = document.getElementById('comp-card-opt-date')      && (document.getElementById('comp-card-opt-date') as HTMLInputElement).checked;
    var footer = document.getElementById('comp-card-el-footer');
    if (footer) footer.style.display = (catOn || rtOn || dateOn) ? '' : 'none';
  }

  export var cardLegacyVariantToggle = document.getElementById('comp-card-variant-toggle');
  if (cardLegacyVariantToggle) {
    cardLegacyVariantToggle.addEventListener('click', function (e) {
      var btn = (e.target as HTMLElement).closest<HTMLElement>('[data-card-legacy-variant-btn]');
      if (!btn) return;
      var variant = btn.dataset.cardLegacyVariantBtn;
      setActiveToggle(cardLegacyVariantToggle, 'data-card-legacy-variant-btn', variant, 'pos-tile-btn--selected');
      var card = document.getElementById('comp-card-el');
      if (card) ['highlighted', 'brand-primary', 'brand-supplementary'].forEach(function (bg) { card!.classList.toggle('pos-card-' + bg, variant === bg); });
      tryRefreshInspect();
    });
  }

  export var legacyCardOptsList = document.getElementById('comp-card-legacy-options-list');
  if (legacyCardOptsList) {
    legacyCardOptsList.addEventListener('change', function (e) {
      var input = (e.target as HTMLElement).closest<HTMLInputElement>('input[type="checkbox"]');
      if (!input) return;
      var item = input.closest<HTMLElement>('[data-legacy-card-opt]');
      var opt = item ? item.dataset.legacyCardOpt : null;
      var on = input.checked;
      if (opt === 'image') {
        var img = document.getElementById('comp-card-el-image');
        if (img) img.style.display = on ? '' : 'none';
      } else if (opt === 'category') {
        var cat = document.getElementById('comp-card-el-category');
        if (cat) cat.style.display = on ? '' : 'none';
        updateLegacyCardFooter();
      } else if (opt === 'readtime') {
        var rt = document.getElementById('comp-card-el-readtime');
        if (rt) rt.style.display = on ? '' : 'none';
        updateLegacyCardFooter();
      } else if (opt === 'date') {
        var dt = document.getElementById('comp-card-el-date');
        if (dt) dt.style.display = on ? '' : 'none';
        updateLegacyCardFooter();
      }
      tryRefreshInspect();
    });
  }

  export var switchSizeToggle = document.getElementById('comp-switch-card-size-toggle');
  registerControl(switchSizeToggle, '[data-switch-size-btn]', function (btn) {
    var size = btn.dataset.switchSizeBtn;
    setActiveToggle(switchSizeToggle, 'data-switch-size-btn', size, 'pos-segmented-control-btn--active');
    var scStage = document.getElementById('comp-switch-card-preview');
    if (scStage) {
      scStage.querySelectorAll<HTMLElement>('.pos-switch-card').forEach(function (card) {
        card.classList.toggle('pos-switch-card--small', size === 'small');
      });
    }
    tryRefreshInspect();
  });

  export var switchOptList = document.getElementById('comp-switch-card-options-list');
  if (switchOptList) {
    switchOptList.addEventListener('change', function (e) {
      var input = (e.target as HTMLElement).closest<HTMLInputElement>('input[type="checkbox"]');
      if (!input) return;
      var card = input.closest<HTMLElement>('[data-switch-opt]');
      var opt = card ? card.dataset.switchOpt : null;
      if (opt === 'icon') {
        var iconEl = document.getElementById('comp-switch-card-el-icon');
        if (iconEl) iconEl.style.display = input.checked ? '' : 'none';
      }
      tryRefreshInspect();
    });
  }

  /* avatar size toggle */
  export var avatarSizeToggle = document.getElementById('comp-avatar-size-toggle');
  registerControl(avatarSizeToggle, '[data-avatar-size-btn]', function (btn) {
    var size = btn.dataset.avatarSizeBtn;
    setActiveToggle(avatarSizeToggle, 'data-avatar-size-btn', size, 'pos-segmented-control-btn--active');
    var el = document.getElementById('comp-avatar-el');
    if (el) {
      el.className = 'pos-avatar pos-avatar-' + size;
    }
    tryRefreshInspect();
  });

  /* avatar options (image toggle) */
  export var avatarOptsList = document.getElementById('comp-avatar-options-list');
  if (avatarOptsList) {
    avatarOptsList.addEventListener('change', function (e) {
      var input = (e.target as HTMLElement).closest<HTMLInputElement>('input[type="checkbox"]');
      if (!input) return;
      var opt = input.closest<HTMLElement>('[data-avatar-opt]');
      if (opt && opt.dataset.avatarOpt === 'image') {
        var img = document.getElementById('comp-avatar-img');
        var initials = document.getElementById('comp-avatar-initials');
        if (img) img.style.display = input.checked ? '' : 'none';
        if (initials) initials.style.display = input.checked ? 'none' : '';
      }
      tryRefreshInspect();
    });
  }





  /* pagination — current page toggle */
  export var paginationPageToggle = document.getElementById('comp-pagination-page-toggle');
  registerControl(paginationPageToggle, '[data-pagination-page]', function (btn) {
    var page = parseInt(btn.dataset.paginationPage, 10);
    var total = 5;
    setActiveToggle(paginationPageToggle, 'data-pagination-page', btn.dataset.paginationPage, 'pos-segmented-control-btn--active');
    document.querySelectorAll<HTMLElement>('#comp-pagination-list a').forEach(function (a, i) {
      var p = i + 1;
      if (p === page) {
        a.setAttribute('aria-current', 'true');
        a.setAttribute('aria-label', 'Current Page, Page ' + p);
      } else {
        a.removeAttribute('aria-current');
        a.setAttribute('aria-label', 'Go to page ' + p);
      }
    });
    var prev = document.getElementById('comp-pagination-prev');
    var next = document.getElementById('comp-pagination-next');
    if (prev) prev.style.visibility = (page === 1) ? 'hidden' : '';
    if (next) next.style.visibility = (page === total) ? 'hidden' : '';
    tryRefreshInspect();
  });

  /* pagination — click on the preview links syncs the right-panel control */
  (function () {
    var list = document.getElementById('comp-pagination-list');
    var prevLink = document.getElementById('comp-pagination-prev');
    var nextLink = document.getElementById('comp-pagination-next');
    var total = 5;

    function getCurrentPage() {
      var cur = document.querySelector<HTMLElement>('#comp-pagination-list a[aria-current="true"]');
      if (!cur) return 1;
      var links = Array.from(document.querySelectorAll<HTMLElement>('#comp-pagination-list a'));
      return links.indexOf(cur) + 1;
    }

    function goToPage(page: number) {
      page = Math.max(1, Math.min(total, page));
      var btn = paginationPageToggle && paginationPageToggle.querySelector<HTMLElement>('[data-pagination-page="' + page + '"]');
      if (btn) btn.click();
    }

    if (list) {
      list.addEventListener('click', function (e) {
        var a = (e.target as HTMLElement).closest('a');
        if (!a) return;
        e.preventDefault();
        var links = Array.from(list.querySelectorAll<HTMLElement>('a'));
        var page = links.indexOf(a) + 1;
        if (page > 0) goToPage(page);
      });
    }

    if (prevLink) {
      prevLink.addEventListener('click', function (e) {
        e.preventDefault();
        goToPage(getCurrentPage() - 1);
      });
    }

    if (nextLink) {
      nextLink.addEventListener('click', function (e) {
        e.preventDefault();
        goToPage(getCurrentPage() + 1);
      });
    }
  })();

  /* Breadcrumb variant (Expanded / Collapsed) toggle wiring lives in switch-component.ts, not
     here — it needs to call switchComponent() directly to defend against a scroll-sync race (see
     that file for the full explanation), and importing switch-component.js here would create a
     circular import (switch-component.ts already imports from this file). */
  export var breadcrumbVariantToggle = document.getElementById('comp-breadcrumb-variant-toggle');