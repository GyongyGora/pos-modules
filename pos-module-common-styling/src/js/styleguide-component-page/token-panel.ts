import { tokenFormat, tokenPanelBody } from './core/dom-refs.js';
import { getActivePreviewStage } from './preview-stage.js';
import { COMP_CONFIGS, ICON_SIZE_MAP, TAG_INTENT_CLASSES } from './comp-configs.js';
import { state } from './core/state.js';
import { Token, Section, DisplayToken, DisplaySection } from './core/types.js';



  export function escapeAttr(str: string | null | undefined): string {
    return str ? str.replace(/&/g, '&amp;').replace(/"/g, '&quot;') : '';
  }

  export function updateSwatches(sourceEl?: HTMLElement | null) {
    var cs = getComputedStyle(sourceEl || document.documentElement);
    document.querySelectorAll<HTMLElement>('[data-swatch-var]').forEach(function (el) {
      var name  = el.dataset.swatchVar;
      var value = cs.getPropertyValue(name).trim();
      if (!value) return;
      /* icon tokens hold a url(...) SVG data-uri, not a solid color —
         render it as a contained image preview instead of a background fill */
      if (name.indexOf('--pos-icon') === 0) {
        el.style.background       = 'none';
        el.style.backgroundImage  = value;
        el.style.backgroundSize   = 'contain';
        el.style.backgroundRepeat = 'no-repeat';
        el.style.backgroundPosition = 'center';
      } else {
        el.style.background = value;
      }
    });
  }

  export function updateTokenValues(sourceEl?: HTMLElement | null) {
    var format = tokenFormat ? tokenFormat.value : 'css';
    var cs = getComputedStyle(sourceEl || document.documentElement);
    document.querySelectorAll<HTMLElement>('[data-css-name]').forEach(function (el) {
      var figma = el.dataset.figmaName;
      var css   = el.dataset.cssName;
      var role  = el.dataset.role;
      /* Figma mode shows the Figma variable name as the primary label when one exists (CSS name
         as the hover tooltip); CSS mode (or a token with no Figma mapping, e.g. figma: null
         CSS-only tokens) always shows the CSS name, with the Figma name as tooltip if available.
         Previously this only ever swapped the tooltip, never the visible text — fixed 2026-08-26.
         The role (if any) is prepended — a title set here on this child span would otherwise
         silently win over the row's own role tooltip while hovering just this text (2026-09-03). */
      var altName = format === 'figma' && figma ? css : (figma || css);
      var cssOnlyInFigmaMode = format === 'figma' && !figma;
      if (format === 'figma' && figma) {
        el.textContent = figma;
      } else {
        el.textContent = css;
      }
      /* mark rows with no Figma mapping so they don't read as real Figma names while browsing
         in Figma-name mode (2026-09-03) — see .comp-token-name-sm--css-fallback in styleguide.css */
      el.classList.toggle('comp-token-name-sm--css-fallback', cssOnlyInFigmaMode);
      el.title = role ? role + ' — ' + altName : altName;
    });
    document.querySelectorAll<HTMLElement>('[data-css-var]').forEach(function (el) {
      var raw  = cs.getPropertyValue(el.dataset.cssVar).trim();
      var role = el.dataset.role;
      /* icon tokens hold a long url(...) SVG data-uri — show a short label
         instead of dumping the raw string, full value still on hover */
      if (raw.indexOf('url(') === 0) {
        el.textContent = 'icon (svg)';
        el.title = role ? role + ' — ' + raw : raw;
      } else {
        el.textContent = raw || '—';
        /* fall back to the row's role instead of an empty title — an empty title on this child
           span would otherwise silently suppress the row's tooltip while hovering the value text. */
        el.title = role || '';
      }
    });
  }

  export var ICON_COLOR      = '<svg viewBox="2 2 20 20" class="comp-tokens-section-icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" style="fill:none;overflow:visible" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 3h-4a2 2 0 0 0 -2 2v12a4 4 0 0 0 8 0v-12a2 2 0 0 0 -2 -2" /><path d="M13 7.35l-2 -2a2 2 0 0 0 -2.828 0l-2.828 2.828a2 2 0 0 0 0 2.828l9 9" /><path d="M7.3 13h-2.3a2 2 0 0 0 -2 2v4a2 2 0 0 0 2 2h12" /><path d="M17 17l0 .01" /></svg>';
  export var ICON_LAYOUT     = '<svg viewBox="2 2 20 20" class="comp-tokens-section-icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" style="fill:none;overflow:visible" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12v-6a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v6" /><path d="M10 18h-7" /><path d="M21 18h-7" /><path d="M6 15l-3 3l3 3" /><path d="M18 15l3 3l-3 3" /></svg>';
  export var ICON_TYPOGRAPHY = '<svg viewBox="2 2 20 20" class="comp-tokens-section-icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" style="fill:none;overflow:visible" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20l3 0" /><path d="M14 20l7 0" /><path d="M6.9 15l6.9 0" /><path d="M10.2 6.3l5.8 13.7" /><path d="M5 20l6 -16l2 0l7 16" /></svg>';
  export var ICON_ELEVATION  = '<svg viewBox="2 2 20 20" class="comp-tokens-section-icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" style="fill:none;overflow:visible" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M7 5a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2l0 -10" /><path d="M17 17v2a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-10a2 2 0 0 1 2 -2h2" /></svg>';
  export var ICON_INTERACTIONS = '<svg viewBox="2 2 20 20" class="comp-tokens-section-icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" style="fill:none;overflow:visible" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12l3 0" /><path d="M12 3l0 3" /><path d="M7.8 7.8l-2.2 -2.2" /><path d="M16.2 7.8l2.2 -2.2" /><path d="M7.8 16.2l-2.2 2.2" /><path d="M12 12l9 3l-4 2l-2 4l-3 -9" /></svg>';

  export function getSectionIcon(heading: string | undefined): string {
    var h = heading.toLowerCase();
    if (h.indexOf('color') === 0 || h === 'container' || h === 'button' || h === 'active button') return ICON_COLOR;
    if (h === 'typography') return ICON_TYPOGRAPHY;
    if (h === 'elevation') return ICON_ELEVATION;
    if (h === 'interactions') return ICON_INTERACTIONS;
    return ICON_LAYOUT;
  }

  /* ── Button spec-driven Tokens/Code panels (docs/inspect refactor, tokens/components/button.json) ──
     Button has multiple variant keys ("<base>[+<intent>]", 12 total — see button.json's own
     knownDiscrepancies for why intent is NOT combinable with itself) instead of one variant like
     select/multiselect, so it needs its own lookup (by state.buttonBase + state.buttonIntent)
     rather than getSpecPanelSections's Object.keys(...)[0] shortcut. */
  export function toButtonDisplayToken(t: Token): DisplayToken {
    /* same universal rule as every other component now (isSwatchEligible, defined below with
       the other swatch helpers) — a manually-maintained non-swatch-roles allowlist kept
       missing entries (e.g. 'elevation', caught 2026-09-02) whenever a new role string was
       introduced without updating this list too; checking the token name itself can't drift. */
    return { css: t.css, figma: t.figma, swatch: isSwatchEligible(t.css), role: t.role };
  }
  export function getButtonVariantSections(base: string, intent: string, status: string, size: string): DisplaySection[] | null {
    var spec = COMPONENT_SPECS['button'];
    if (!spec) return null;
    var variantKey = base + (intent && intent !== 'none' ? '+' + intent : '');
    var variant = spec.variants[variantKey];
    if (!variant) return null;
    var stateData = variant.states[status] || variant.states.normal;
    if (!stateData) return null;
    var sizeOverrides = (size === 'small' && spec.sizeOverrides) ? spec.sizeOverrides.small : null;
    var overrideByAppliesTo: Record<string, any> = {};
    (sizeOverrides || []).forEach(function (o: any) { overrideByAppliesTo[o.appliesTo] = o; });
    return (stateData.sections || []).map(function (s: any) {
      var rawTokens = s.ref ? (spec.shared[s.ref.replace('shared.', '')] || []) : (s.tokens || []);
      var tokens = rawTokens.map(function (t: any) {
        if (overrideByAppliesTo['padding-inline'] && t.css === '--pos-padding-button') return overrideByAppliesTo['padding-inline'];
        if (overrideByAppliesTo['font-size'] && t.css === '--pos-font-size-big-button-text') return overrideByAppliesTo['font-size'];
        return t;
      }).map(toButtonDisplayToken);
      return { heading: s.heading, tokens: tokens };
    });
  }

  /* ── Code component (pos-code) spec-driven Tokens ── the "Kind" toggle (added 2026-08-26,
     Variants tab) now selects exactly one of inline/block at a time — matching Button's Base
     toggle pattern — so this only ever returns the currently selected kind's sections. */
  export function toCodeDisplayToken(t: Token): DisplayToken {
    /* was hardcoded swatch:true regardless of the token — wrong for Code's own Layout
       section (radius/font-size/font-family, none of them colors); same universal
       isSwatchEligible rule as every other component now (2026-09-02). */
    return { css: t.css, figma: t.figma, swatch: isSwatchEligible(t.css), role: t.role };
  }
  export function getCodeVariantSections(kind: string, variantToggle: string, size: string, numbered: boolean): DisplaySection[] | null {
    var spec = COMPONENT_SPECS['code'];
    if (!spec) return null;
    var key = kind === 'block'
      ? 'block-' + (variantToggle === 'light' ? 'alt' : 'default') + '-' + size + '-' + (numbered ? 'on' : 'off')
      : 'inline-' + (variantToggle === 'dark' ? 'alt' : 'default') + '-' + size;
    var variant = spec.variants[key];
    if (!variant) return null;
    var out: DisplaySection[] = [];
    (variant.states.normal.sections || []).forEach(function (s: any) {
      var tokens = (s.ref ? (spec.shared[s.ref.replace('shared.', '')] || []) : (s.tokens || [])).map(toCodeDisplayToken);
      out.push({ heading: s.heading, tokens: tokens });
    });
    /* an empty array is a valid "no tokens apply" result (distinct from the null
       returned above for "no spec/variant found") — collapsing it to null here
       made renderTokenPanel bail out and leave the PREVIOUS state's tokens on
       screen instead of clearing the panel. */
    return out;
  }

  /* ── Generic spec-driven Tokens (component migration batch, 2026-08-26) ── covers every migrated
     component that has exactly ONE representative variant (its preview shows a single instance, no
     Variant/Base toggle needed) — the vast majority of the batch. Mirrors getSpecPanelSections'
     "first variant key" shortcut but reads COMPONENT_SPECS (the new schema) instead of the old
     INSPECT_SPECS. Also folds in the simple error/success "Intent" override some form components
     have (text-input, textarea, select): when the variant has a dedicated states.error/states.success
     entry and the Intent control is set to it, that entry is used whole instead of the base status
     — those entries already list every relevant token directly (not a delta), so no merging needed. */
  export function toGenericDisplayToken(t: Token): DisplayToken {
    /* explicit swatch field always wins; otherwise default by whether this is a real color
       token (RULES.md §7.7/isSwatchEligible) — a token with no swatch field is NOT
       automatically shown just because it wasn't explicitly hidden. */
    var swatch = (t.swatch === true || t.swatch === false) ? t.swatch : isSwatchEligible(t.css);
    return { css: t.css, figma: t.figma, swatch: swatch, role: t.role };
  }
  export function getGenericVariantSections(compKey: string, status: string, size: string, intent: string): DisplaySection[] | null {
    var spec = COMPONENT_SPECS[compKey];
    if (!spec || !spec.variants) return null;
    var variant = spec.variants[compKey] || spec.variants[Object.keys(spec.variants)[0]];
    if (!variant || !variant.states) return null;
    /* combined "<intent>-<status>" entry wins when the spec has one (e.g. "error-filled") —
       falls back to the flat intent-only entry, then to the plain status, so components that
       haven't had their combined states built out yet keep working exactly as before. */
    var combinedKey = intent && intent !== 'normal' ? intent + '-' + status : null;
    var effectiveStatus = (combinedKey && variant.states[combinedKey]) ? combinedKey
      : (intent && intent !== 'normal' && variant.states[intent]) ? intent
      : status;
    var stateData = variant.states[effectiveStatus] || variant.states.normal || variant.states[Object.keys(variant.states)[0]];
    if (!stateData) return null;
    var out = (stateData.sections || []).map(function (s: any) {
      var raw = s.ref ? (spec.shared[s.ref.replace('shared.', '')] || []) : (s.tokens || []);
      return { heading: s.heading, tokens: filterConditionalTokens(raw).map(toGenericDisplayToken) };
    }).filter(function (s: DisplaySection) { return s.tokens.length; });
    /* Size overrides — for the few "simple" components (currently just Link) whose Size toggle
       swaps a specific token (e.g. --pos-font-size-body -> -body-small) rather than affecting
       which variant/state is shown. spec.sizeOverrides.small is a flat list of {from, to[, figma]}
       — same shape/purpose as Button's sizeOverrides, generalized so any component can declare it
       without a bespoke function. */
    if (size === 'small' && spec.sizeOverrides && spec.sizeOverrides.small) {
      var overrides = spec.sizeOverrides.small;
      out = out.map(function (sec: DisplaySection) {
        var tokens = sec.tokens.map(function (t) {
          var o = overrides.filter(function (ov: any) { return ov.from === t.css; })[0];
          if (!o) return t;
          return { css: o.to, figma: o.figma !== undefined ? o.figma : t.figma, swatch: isSwatchEligible(o.to) };
        });
        return { heading: sec.heading, tokens: tokens };
      });
    }
    /* an empty array is a valid "no tokens apply" result (e.g. Popover's Closed
       state) — collapsing it to null made renderTokenPanel bail out and leave
       the PREVIOUS state's tokens on screen instead of clearing the panel. */
    return out;
  }

  /* ── Chip / Segmented / Tag ── these 3 keep ALL their inspect-derived variants (intent × size ×
     etc — see tokens/components/{chip,segmented,tag}.json) rather than one representative, and
     each got a NEW preview-filtering toggle (2026-08-26, pre-decided per-component calls)
     alongside their pre-existing Intent/Size toggles. Since 2+ toggles now
     compose to pick the exact variant, the simplest correct source of truth is the actually-visible
     preview element's own classList — no parallel JS state to keep in sync, can't drift from what's
     really rendered. */
  export function getChipVariantSections(status: string): DisplaySection[] | null {
    var spec = COMPONENT_SPECS['chip'];
    if (!spec) return null;
    var stage = document.getElementById('comp-chip-preview');
    var el = stage && stage.querySelector<HTMLElement>('.comp-preview-variant-row:not([hidden]) .pos-chip');
    if (!el) return null;
    var intent = ['warning', 'success', 'error', 'neutral'].filter(function (i) { return el.classList.contains('pos-chip-' + i); })[0] || 'neutral';
    var key = intent + (el.classList.contains('pos-chip--prominent') ? '-prominent' : '') + (el.classList.contains('pos-chip--tiny') ? '-tiny' : '');
    var variant = spec.variants[key];
    if (!variant) return null;
    var stateData = variant.states.normal;
    if (!stateData) return null;
    return resolveSections(stateData.sections, spec.shared, false);
  }

  export function getSegmentedVariantSections(status: string, size: string): DisplaySection[] | null {
    var spec = COMPONENT_SPECS['segmented'];
    if (!spec) return null;
    var stage = getActivePreviewStage();
    var el = stage && stage.querySelector<HTMLElement>('.comp-preview-variant-row:not([hidden]) .pos-segmented-control');
    if (!el) return null;
    var key = el.classList.contains('pos-segmented-control--highlighted') ? 'highlighted'
      : el.classList.contains('pos-segmented-control--subtle') ? 'subtle' : 'default';
    var variant = spec.variants[key];
    if (!variant) return null;
    var inspectStatus = status === 'normal' ? 'inactive' : status;
    var stateData = variant.states[inspectStatus] || variant.states.inactive;
    if (!stateData) return null;
    return resolveSections(stateData.sections, spec.shared, size === 'small');
  }

  /* Tag keeps 22 flat variant keys (intent × interactive/removable × selected — see tag.json)
     instead of nesting "selected" as a state within each intent's variant, since a selected
     tag's tokens don't decompose that way. Was reading ONLY .pos-tag-interactive off the DOM
     (confirmed 2026-09-02: Intent and Selected had zero effect on the Tokens panel, which
     always showed either plain 'interactive' or 'default' regardless of which was actually
     visible) — this reconstructs the exact key from every class/attribute that participates:
       selected:      {removable-}{intent-}selected   (selected implies interactive; there is
                       no separate "interactive-...-selected" key — being selected already
                       means it's the interactive kind)
       removable:     removable{-intent}
       interactive:   interactive-{intent}, except neutral which is named the other way
                       around ("neutral-interactive") — an existing naming asymmetry in
                       tag.json, not something to "normalize" here
       plain:         {intent} or 'default'
     matches all 22 keys in tag.json exactly; falls back to 'default' if a class combination
     that doesn't map to any real key ever occurs (shouldn't, given the toggles available). */
  export function resolveTagVariantKey(el: HTMLElement): string {
    var intent = TAG_INTENT_CLASSES.filter(function (c) { return el.classList.contains(c); })
      .map(function (c) { return c.replace('pos-tag-', ''); })[0];
    var isRemovable = el.dataset.tagVariant === 'removable';
    var isInteractive = el.classList.contains('pos-tag-interactive');
    var isSelected = el.classList.contains('pos-tag-selected');

    if (isSelected) {
      if (isRemovable) return intent ? ('removable-' + intent + '-selected') : 'removable-selected';
      return intent ? (intent + '-selected') : 'selected';
    }
    if (isRemovable) return intent ? ('removable-' + intent) : 'removable';
    if (isInteractive) return intent === 'neutral' ? 'neutral-interactive' : (intent ? ('interactive-' + intent) : 'interactive');
    return intent || 'default';
  }

  export function getTagVariantSections(status: string): DisplaySection[] | null {
    var spec = COMPONENT_SPECS['tag'];
    if (!spec) return null;
    var stage = document.getElementById('comp-tag-preview') || getActivePreviewStage();
    var row = stage && stage.querySelector<HTMLElement>('.comp-preview-variant-row:not([hidden])');
    if (!row) return null;
    var el = row.querySelector<HTMLElement>('.pos-tag-interactive') || row.querySelector<HTMLElement>('.pos-tag');
    if (!el) return null;
    var key = resolveTagVariantKey(el);
    var variant = spec.variants[key] || spec.variants['default'];
    if (!variant) return null;
    /* "selected" is itself a variant key (above), not a per-variant state — the element never
       carries a hover/focus/disabled class at the same time (Tag's State group is one radio
       set: Normal/Hover/Focus/Disabled/Selected), so look up 'normal' within the resolved
       selected-flavored variant rather than a nonexistent 'selected' state. */
    var lookupStatus = (status === 'selected') ? 'normal' : status;
    var stateData = variant.states[lookupStatus] || variant.states.normal;
    if (!stateData) return null;
    return resolveSections(stateData.sections, spec.shared, false);
  }

  /* ── Card (legacy) ── same bug class as Switch card: the
     Default/Highlighted toggle (card-legacy-variant) is a real variant switch with different
     tokens, but the earlier generic migration only kept one representative variant, so toggling
     never updated the Tokens panel. Fixed the same way as Chip/Tag/Segmented — read which variant
     is actually live off the DOM (#comp-card-el's own class), not a static pick. */
  export function getCardVariantSections(status: string): DisplaySection[] | null {
    var spec = COMPONENT_SPECS['card'];
    if (!spec) return null;
    var el = document.getElementById('comp-card-el');
    if (!el) return null;
    var key = el.classList.contains('pos-card-highlighted') ? 'content-highlighted'
      : el.classList.contains('pos-card-brand-primary') ? 'content-brand-primary'
      : el.classList.contains('pos-card-brand-supplementary') ? 'content-brand-supplementary' : 'content';
    var variant = spec.variants[key];
    if (!variant) return null;
    var stateData = variant.states[status] || variant.states.normal;
    if (!stateData) return null;
    return resolveSections(stateData.sections, spec.shared, false);
  }

  /* Toast — 2026-09-03, same DOM-reading pattern as Alert card below: reads the currently visible
     preview row's own data-variant (success/error/info), no tracked JS state to drift from what's
     rendered. Only 'normal'/'hover' are real states (the close button's own :hover) — anything else
     falls back to normal via variant.states[status] || variant.states.normal. */
  export function getToastVariantSections(status: string): DisplaySection[] | null {
    var spec = COMPONENT_SPECS['toast'];
    if (!spec) return null;
    var stage = document.getElementById('comp-toast-preview');
    var row = stage && stage.querySelector<HTMLElement>('.comp-preview-variant-row:not([hidden])');
    var key = row ? row.dataset.variant : 'success';
    var variant = spec.variants[key];
    if (!variant) return null;
    var stateData = variant.states[status] || variant.states.normal;
    if (!stateData) return null;
    return resolveSections(stateData.sections, spec.shared, false);
  }

  /* Dialog — 2026-09-04. The Default/Simple variant is layout-only (whether a title is shown);
     it doesn't change any token, so this ignores which preview row is visible and always reads
     the single 'dialog' variant key — only 'status' (normal/hover/focus, the close button's own
     state) actually changes which tokens are shown. */
  export function getDialogVariantSections(status: string): DisplaySection[] | null {
    var spec = COMPONENT_SPECS['dialog'];
    if (!spec) return null;
    var variant = spec.variants.dialog;
    if (!variant) return null;
    var stateData = variant.states[status] || variant.states.normal;
    if (!stateData) return null;
    return resolveSections(stateData.sections, spec.shared, false);
  }

  /* Markdown editor — 2026-09-04. No Variant/State toggle exists: EasyMDE manages its own internal
     interaction state, which can't be simulated via a debug class. Single static representative
     view, ignores status entirely — same known-limitation pattern as File upload/Card/Feature card. */
  export function getMarkdownVariantSections(): DisplaySection[] | null {
    var spec = COMPONENT_SPECS['markdown'];
    if (!spec) return null;
    var variant = spec.variants.markdown;
    if (!variant) return null;
    var stateData = variant.states.normal;
    if (!stateData) return null;
    return resolveSections(stateData.sections, spec.shared, false);
  }

  /* File upload — 2026-09-04. No Variant/State toggle exists: Uppy manages its own internal
     interaction (drag-over, file-added, etc.), which can't be simulated via a debug class the way
     .pos-close's hover/focus can. Single static representative view, ignores status entirely —
     same known-limitation pattern already accepted for Card/Feature card. */
  export function getFileUploadVariantSections(): DisplaySection[] | null {
    var spec = COMPONENT_SPECS['file-upload'];
    if (!spec) return null;
    var variant = spec.variants['file-upload'];
    if (!variant) return null;
    var stateData = variant.states.normal;
    if (!stateData) return null;
    return resolveSections(stateData.sections, spec.shared, false);
  }

  /* Toggle button — 2026-09-04. Reads the currently visible preview row's own data-variant
     (used as the state key here, off/on/off-disabled/on-disabled), same DOM-reading pattern as
     Tab/Table/Toast/Alert card above. */
  export function getToggleBtnVariantSections(): DisplaySection[] | null {
    var spec = COMPONENT_SPECS['toggle-btn'];
    if (!spec) return null;
    var stage = document.getElementById('comp-toggle-btn-preview');
    var row = stage && stage.querySelector<HTMLElement>('.comp-preview-variant-row:not([hidden])');
    var key = row ? row.dataset.variant : 'off';
    var variant = spec.variants['toggle-btn'];
    if (!variant) return null;
    var stateData = variant.states[key] || variant.states.off;
    if (!stateData) return null;
    return resolveSections(stateData.sections, spec.shared, false);
  }

  /* Tab — 2026-09-04. Reads the currently visible preview row's own data-variant, same
     DOM-reading pattern as Table/Toast/Alert card above. */
  export function getTabVariantSections(status: string): DisplaySection[] | null {
    var spec = COMPONENT_SPECS['tab'];
    if (!spec) return null;
    var stage = document.getElementById('comp-tab-preview');
    var row = stage && stage.querySelector<HTMLElement>('.comp-preview-variant-row:not([hidden])');
    var key = row ? row.dataset.variant : 'normal';
    var variant = spec.variants[key];
    if (!variant) return null;
    var stateData = variant.states[status] || variant.states.normal;
    if (!stateData) return null;
    return resolveSections(stateData.sections, spec.shared, false);
  }

  /* Table — 2026-09-04. Reads the currently visible preview row's own data-variant
     (default/card), same DOM-reading pattern as Toast/Alert card above. */
  export function getTableVariantSections(status: string): DisplaySection[] | null {
    var spec = COMPONENT_SPECS['table'];
    if (!spec) return null;
    var stage = document.getElementById('comp-table-preview');
    var row = stage && stage.querySelector<HTMLElement>('.comp-preview-variant-row:not([hidden])');
    var key = row ? row.dataset.variant : 'default';
    var variant = spec.variants[key];
    if (!variant) return null;
    var stateData = variant.states[status] || variant.states.normal;
    if (!stateData) return null;
    return resolveSections(stateData.sections, spec.shared, false);
  }

  /* Alert card (legacy) — 2026-09-01, same DOM-reading pattern as Card above: reads the currently
     visible preview row's own data-variant, no tracked JS state to drift from what's rendered. */
  export function getAlertCardVariantSections(status: string): DisplaySection[] | null {
    var spec = COMPONENT_SPECS['alert-card'];
    if (!spec) return null;
    var stage = document.getElementById('comp-alert-card-preview');
    var row = stage && stage.querySelector<HTMLElement>('.comp-preview-variant-row:not([hidden])');
    var key = row ? row.dataset.variant : 'info';
    var variant = spec.variants[key];
    if (!variant) return null;
    var stateData = variant.states.normal;
    if (!stateData) return null;
    return resolveSections(stateData.sections, spec.shared, false);
  }

  /* ── Feature card ── 2026-09-01. Size (Small/Default/Large) previously mutated the preview's
     classes directly with no tracked JS state (a known, accepted limitation) — the Tokens panel
     always showed the Default size's typography/icon-size tokens
     regardless of the toggle. Reads the actually-visible preview element's own classList (same
     no-drift-possible pattern as getCardVariantSections/getChipVariantSections above), then swaps
     in the size-specific tokens declared in feature-card.json's cardSizeOverrides — matched by
     `role` (not just `css`), since "Lead font family" and "Text font family" share the same resting
     token value but only one of them changes at the Large size. */
  export function getFeatureCardVariantSections(status: string): DisplaySection[] | null {
    var spec = COMPONENT_SPECS['feature-card'];
    if (!spec) return null;
    var el = document.querySelector<HTMLElement>('#comp-feature-card-preview .pos-feature-card');
    if (!el) return null;
    var variant = spec.variants['feature-card'];
    if (!variant) return null;
    var stateData = variant.states[status] || variant.states.normal;
    if (!stateData) return null;
    var sizeKey = el.classList.contains('pos-feature-card--small') ? 'small'
      : el.classList.contains('pos-feature-card--large') ? 'large' : null;
    var bgKey = ['highlighted', 'brand-primary', 'brand-supplementary'].filter(function (b) { return el!.classList.contains('pos-feature-card--' + b); })[0];
    var sizeOverrides = sizeKey && spec.cardSizeOverrides ? spec.cardSizeOverrides[sizeKey] : [];
    var bgOverrides = bgKey && spec.backgroundOverrides ? spec.backgroundOverrides[bgKey] : [];
    var all = (sizeOverrides || []).concat(bgOverrides || []);
    var overrides = all.length ? all : null;
    var sections = JSON.parse(JSON.stringify(stateData.sections));
    if (overrides) {
      sections.forEach(function (sec: any) {
        sec.tokens.forEach(function (t: any) {
          var o = overrides.filter(function (ov: any) {
            return ov.appliesToRole ? ov.appliesToRole === t.role : ov.from === t.css;
          })[0];
          if (o) { t.css = o.to; if (o.figma !== undefined) t.figma = o.figma; }
        });
      });
    }
    return resolveSections(sections, spec.shared, false);
  }

  /* ── Control icons ── migrated 2026-08-27 (deferred from the 2026-08-26 batch). The Layout
     section's icon-size token is swapped in at render time from the CURRENT icon-size toggle
     value (state.iconSize, already tracked) rather than a static pick — mirrors how the old
     buildControlIconsInspectSpec(iconSize) regenerated on every resize, just without needing to
     rebuild the whole spec object each time. */
  export function getControlIconsVariantSections(kind: string, size: string, status: string): DisplaySection[] | null {
    var spec = COMPONENT_SPECS['control-icons'];
    if (!spec) return null;
    var variant = spec.variants[kind];
    if (!variant) return null;
    var stateData = variant.states[status] || variant.states.normal;
    if (!stateData) return null;
    var sz = ICON_SIZE_MAP[size] || ICON_SIZE_MAP['m'];
    var iconSizeCssNames = Object.keys(ICON_SIZE_MAP).map(function (k) { return ICON_SIZE_MAP[k].css; });
    var out = (stateData.sections || []).map(function (s: any) {
      var raw = s.ref ? (spec.shared[s.ref.replace('shared.', '')] || []) : (s.tokens || []);
      var tokens = raw.map(function (t: any) {
        /* only the icon-size entry swaps with the current Size toggle — every
           other Layout token (e.g. --pos-radius-button) must pass through
           unchanged, otherwise it gets silently overwritten/duplicated */
        if (s.heading === 'Layout' && iconSizeCssNames.indexOf(t.css) !== -1) {
          return { css: sz.css, figma: sz.figma, swatch: false };
        }
        var swatch = (t.swatch === true || t.swatch === false) ? t.swatch : isSwatchEligible(t.css);
        return { css: t.css, figma: t.figma, swatch: swatch, role: t.role };
      });
      return { heading: s.heading, tokens: tokens };
    });
    /* an empty array is a valid "no tokens apply" result — collapsing it to null
       made renderTokenPanel bail out and leave stale content on screen. */
    return out;
  }

  /* Breadcrumb — 2026-09-19, same DOM-reading pattern as Card above: reads whether the live
     preview's #comp-breadcrumb-el actually has .pos-breadcrumb--collapsed (toggled either by the
     docs-only Variant control or, in production, by pos-breadcrumb.js's real ResizeObserver), so
     Expanded/Collapsed never drifts from what the Tokens panel shows. */
  export function getBreadcrumbVariantSections(status: string): DisplaySection[] | null {
    var spec = COMPONENT_SPECS['breadcrumb'];
    if (!spec) return null;
    var el = document.getElementById('comp-breadcrumb-el');
    if (!el) return null;
    var key = el.classList.contains('pos-breadcrumb--collapsed') ? 'collapsed' : 'expanded';
    var variant = spec.variants[key];
    if (!variant) return null;
    var stateData = variant.states[status] || variant.states.normal;
    if (!stateData) return null;
    return resolveSections(stateData.sections, spec.shared, false);
  }

  /* Tooltip — the Type control (Text / Icon-text) shows one preview row; read which one is
     visible, so the Tokens panel always matches the preview */
  export function getTooltipVariantSections(status: string): DisplaySection[] | null {
    var spec = COMPONENT_SPECS['tooltip'];
    if (!spec) return null;
    var stage = document.getElementById('comp-tooltip-preview');
    var row = stage && stage.querySelector<HTMLElement>('.comp-preview-variant-row:not([hidden])');
    var variant = spec.variants[(row && row.dataset.variant) || 'text'];
    if (!variant) return null;
    var stateData = variant.states[status] || variant.states.normal;
    if (!stateData) return null;
    return resolveSections(stateData.sections, spec.shared, false);
  }

  /* badge — the active variant is read from the live preview's classes (type × size). */
  export function getBadgeVariantSections(status: string): DisplaySection[] | null {
    var spec = COMPONENT_SPECS['badge'];
    if (!spec) return null;
    var stage = document.getElementById('comp-badge-preview') || getActivePreviewStage();
    if (!stage) return null;
    var el = stage.querySelector<HTMLElement>('.pos-badge');
    if (!el) return null;
    var type = ['dot', 'number', 'max-count'].filter(function (t) { return el!.classList.contains('pos-badge--' + t); })[0] || 'number';
    var intent = ['confirmation', 'brand', 'neutral'].filter(function (i) { return el!.classList.contains('pos-badge--' + i); })[0];
    var key = type + '-' + (el.classList.contains('pos-badge--small') ? 'small' : 'big') + (intent ? '-' + intent : '');
    var variant = spec.variants[key];
    if (!variant) return null;
    var stateData = variant.states[status] || variant.states.normal;
    if (!stateData) return null;
    return resolveSections(stateData.sections, spec.shared, false);
  }

  export function renderTokenPanel(status: string, size: string): void {
    if (!tokenPanelBody) return;
    var sections: any;
    if (state.comp === 'button' && COMPONENT_SPECS['button']) {
      sections = getButtonVariantSections(state.buttonBase, state.buttonIntent, status, size);
      if (!sections) return;
    } else if (state.comp === 'code' && COMPONENT_SPECS['code']) {
      sections = getCodeVariantSections(state.codeKind, state.codeVariant, state.codeSize, state.codeNumbered);
      if (!sections) return;
    } else if (state.comp === 'chip' && COMPONENT_SPECS['chip']) {
      sections = getChipVariantSections(status);
      if (!sections) return;
    } else if (state.comp === 'segmented' && COMPONENT_SPECS['segmented']) {
      sections = getSegmentedVariantSections(status, size);
      if (!sections) return;
    } else if (state.comp === 'tag' && COMPONENT_SPECS['tag']) {
      sections = getTagVariantSections(status);
      if (!sections) return;
    } else if (state.comp === 'card' && COMPONENT_SPECS['card']) {
      sections = getCardVariantSections(status);
      if (!sections) return;
    } else if (state.comp === 'toast' && COMPONENT_SPECS['toast']) {
      sections = getToastVariantSections(status);
      if (!sections) return;
    } else if (state.comp === 'alert-card' && COMPONENT_SPECS['alert-card']) {
      sections = getAlertCardVariantSections(status);
      if (!sections) return;
    } else if (state.comp === 'dialog' && COMPONENT_SPECS['dialog']) {
      sections = getDialogVariantSections(status);
      if (!sections) return;
    } else if (state.comp === 'markdown' && COMPONENT_SPECS['markdown']) {
      sections = getMarkdownVariantSections();
      if (!sections) return;
    } else if (state.comp === 'file-upload' && COMPONENT_SPECS['file-upload']) {
      sections = getFileUploadVariantSections();
      if (!sections) return;
    } else if (state.comp === 'toggle-btn' && COMPONENT_SPECS['toggle-btn']) {
      sections = getToggleBtnVariantSections();
      if (!sections) return;
    } else if (state.comp === 'tab' && COMPONENT_SPECS['tab']) {
      sections = getTabVariantSections(status);
      if (!sections) return;
    } else if (state.comp === 'table' && COMPONENT_SPECS['table']) {
      sections = getTableVariantSections(status);
      if (!sections) return;
    } else if (state.comp === 'feature-card' && COMPONENT_SPECS['feature-card']) {
      sections = getFeatureCardVariantSections(status);
      if (!sections) return;
    } else if (state.comp === 'control-icons' && COMPONENT_SPECS['control-icons']) {
      var ciStage = document.getElementById('comp-control-icons-preview');
      var ciRow = ciStage && ciStage.querySelector<HTMLElement>('.comp-preview-variant-row:not([hidden])');
      var ciKind = ciRow ? ciRow.dataset.variant : 'close';
      sections = getControlIconsVariantSections(ciKind, state.iconSize, status);
      if (!sections) return;
    } else if (state.comp === 'breadcrumb' && COMPONENT_SPECS['breadcrumb']) {
      sections = getBreadcrumbVariantSections(status);
      if (!sections) return;
    } else if (state.comp === 'tooltip' && COMPONENT_SPECS['tooltip']) {
      sections = getTooltipVariantSections(status);
      if (!sections) return;
    } else if (state.comp === 'badge' && COMPONENT_SPECS['badge']) {
      sections = getBadgeVariantSections(status);
      if (!sections) return;
    } else if (COMPONENT_SPECS[state.comp]) {
      sections = getGenericVariantSections(state.comp, status, size, state.intent);
      if (!sections) return;
    } else {
      /* every real component has a COMPONENT_SPECS entry as of 2026-08-27 (docs/inspect refactor
         complete) — this branch is now unreachable in practice, kept only as a defensive fallback. */
      if (!state.tokenMap) return;
      sections = state.tokenMap[status] || state.tokenMap['normal'];
    }
    var html = '';
    sections.forEach(function (section: DisplaySection) {
      html += '<div class="comp-tokens-section">';
      html += '<h4 class="comp-tokens-section-heading">' + getSectionIcon(section.heading) + section.heading + '</h4>';
      filterConditionalTokens(section.tokens).forEach(function (token: Token) {
        var noSwatch = !token.swatch;
        /* a descriptive role (a full sentence, e.g. "Dropdown arrow color...") explains what this
           specific token is FOR when two rows share the same css/figma name but mean different
           things (e.g. multiselect's dropdown arrow vs. its filter-clear button both reading
           --pos-color-interactive) — a short structural role ("background", "frame") is used only
           for swatch-default logic elsewhere and would just be noise as a tooltip, so it's excluded
           by length rather than by an explicit allowlist of roles. */
        var isDescriptiveRole = token.role && token.role.length > 20;
        var titleAttr = isDescriptiveRole ? ' title="' + escapeAttr(token.role) + '"' : '';
        /* the role tooltip is set on the row (title="...") so hovering blank space also shows it,
           but a native title on a CHILD element always wins over an ancestor's while hovering that
           child specifically — the swatch/name/value spans below have no title of their own here,
           so they correctly fall through to the row's. updateSwatches()/updateTokenValues() (which
           run on every theme/format change, long after this HTML is built) DO set their own title
           on the name/value spans — data-role carries the same role text to them so they can merge
           it in instead of silently shadowing it (2026-09-03 fix — previously hovering the name or
           value text showed only the css/figma-name tooltip, or nothing, never the role). */
        var roleDataAttr = isDescriptiveRole ? ' data-role="' + escapeAttr(token.role) + '"' : '';
        html += '<div class="comp-tokens-row' + (noSwatch ? ' comp-tokens-row--no-swatch' : '') + '"' + titleAttr + '>';
        if (!noSwatch) {
          html += '<span class="comp-token-swatch-sm" data-swatch-var="' + escapeAttr(token.css) + '"' + roleDataAttr + '></span>';
        }
        var figmaAttr = token.figma ? ' data-figma-name="' + escapeAttr(token.figma) + '"' : '';
        html += '<span class="comp-token-name-sm" data-css-name="' + escapeAttr(token.css) + '"' + figmaAttr + roleDataAttr + '></span>';
        html += '<span class="comp-token-val-sm" data-css-var="' + escapeAttr(token.css) + '"' + roleDataAttr + '></span>';
        html += '</div>';
      });
      html += '</div>';
    });
    /* "Composed of" — nested DS components this one visibly embeds (e.g. Multiselect's
       selected-item pills are real Tag components, its dropdown options are real Checkboxes).
       Their OWN tokens are never duplicated into this panel — click a chip to jump to that
       component's own Tokens tab instead. Keeps this panel scannable and single-sourced. */
    var composedOf = (COMPONENT_SPECS[state.comp] && COMPONENT_SPECS[state.comp].composedOf) || [];
    if (composedOf.length) {
      html += '<div class="comp-tokens-section comp-tokens-composed-of">';
      html += '<h4 class="comp-tokens-section-heading">Composed of</h4>';
      html += '<div class="comp-composed-of-chips">';
      composedOf.forEach(function (key: string) {
        var label = (COMP_CONFIGS[key] && COMP_CONFIGS[key].name) || key;
        html += '<button type="button" class="pos-tag pos-tag-interactive comp-composed-of-chip" data-composed-of-key="' + escapeAttr(key) + '">' + escapeAttr(label) + '</button>';
      });
      html += '</div></div>';
    }
    tokenPanelBody.innerHTML = html;
    updateSwatches();
    updateTokenValues();
  }

  /* ── inspect panel ──────────────────────────────────────────────
     Hovering any interactive element in the preview stage shows only
     that element's tokens (for the current state) in the tokens panel.
     Data comes from embedded <script type="application/json"> blocks
     whose IDs match comp-inspect-{key}.
  ─────────────────────────────────────────────────────────────────── */

  /* parse embedded component specs (tokens/components/*.json) — auto-discovered, no manual
     list needed. Single source for the Variants/Usage/Tokens tabs on every component. */
  export var COMPONENT_SPECS: Record<string, any> = {};
  document.querySelectorAll<HTMLElement>('script[type="application/json"][id^="comp-spec-"]').forEach(function (el) {
    var key = el.id.replace('comp-spec-', '');
    try { COMPONENT_SPECS[key] = JSON.parse(el.textContent); } catch (e) {
      console.error('[styleguide] Failed to parse component spec for "' + key + '":', e);
    }
  });

  /* tokens can declare "requiresSelector": only shown in the inspect panel
     when a matching element currently exists in the DOM (e.g. the required
     asterisk token only applies while the field's [required] attribute is on) */
  export function filterConditionalTokens(tokens: Token[] | null | undefined): Token[] {
    return (tokens || []).filter(function (t) {
      if (!t.requiresSelector) return true;
      try { return !!document.querySelector<HTMLElement>(t.requiresSelector); } catch (e) { return true; }
    });
  }

  /* Swatch eligibility is decided by the TOKEN ITSELF, never by which section it's filed
     under (confirmed 2026-09-02, after repeatedly getting this wrong both ways: Elevation's
     shadow tokens got swatches they shouldn't have, and genuine colors filed under a
     non-"Color" heading — Focus indicator's --pos-color-focused, Strength meter's
     --pos-color-warning/-important/-confirmation/-content-icon-disabled — were denied
     swatches they should have). A token is swatch-eligible if and only if it's a real single
     color value: css name starts with `--pos-color-`. Shadows (`--pos-primitive-shadow-*` /
     `--pos-shadow-*`), dimensions, and everything else never get one. */
  /* Not a name guess (--pos-color-* prefix matching missed/wrongly-matched cases both ways —
     confirmed 2026-09-02) — resolve what the token ACTUALLY is. CSS custom properties, unlike
     standard properties, are returned by getComputedStyle() as their literal authored source
     text, not normalized — colors in this codebase are almost always authored as hex, so a
     token resolving to a hex string genuinely is a color. rgb()/rgba() is also accepted: e.g.
     --pos-color-frame-transparent resolves through --pos-primitive-color-transparent, authored
     as `rgb(255 255 255 / 0%)` in light/dark (only its HC value is hex) — hex-only would make
     that one token's swatch eligibility flip depending on which theme happened to be active
     when the panel rendered, which isn't a real distinction. Anything else (px/rem dimensions,
     quoted font stacks, multi-part shadow lists, url(...) icon data) genuinely isn't a color. */
  export var COLOR_VALUE_RE = /^(#[0-9a-f]{3,8}|rgba?\(|hsla?\()/i;
  export function isSwatchEligible(css: unknown): boolean {
    if (typeof css !== 'string') return false;
    var value = getComputedStyle(document.documentElement).getPropertyValue(css).trim();
    return COLOR_VALUE_RE.test(value);
  }

  /* Swatch default (RULES.md §7.7): a color token shows its swatch unless explicitly marked
     `swatch: false`; a non-color token never gets a default swatch unless explicitly marked
     `swatch: true` (which should not happen — see 7.7). This is the ONE place every
     resolveSections() caller (Chip, Segmented, Tag, Card, and any future component using this
     generic path) gets its swatch resolved, so a spec JSON that simply omits the field for a
     Color token still renders correctly instead of silently showing no swatch at all — the bug
     found 2026-08-29 on Chip (48/48 Color tokens had no explicit `swatch`, so every single one
     rendered without its color preview). Button/Code have their own separate display-token
     mappers (toButtonDisplayToken/toCodeDisplayToken) with their own rules, unaffected by this. */
  export function applySwatchDefaults(heading: string | undefined, tokens: Token[] | null | undefined): DisplayToken[] {
    return (tokens || []).map(function (t): DisplayToken {
      if (t.swatch === true || t.swatch === false) return t as DisplayToken; /* explicit — never override */
      return Object.assign({}, t, { swatch: isSwatchEligible(t.css) });
    });
  }

  /* resolve "ref": "shared.layout" pointers in section arrays.
     A whole section is dropped once conditional filtering leaves it with no
     tokens (e.g. "Strength meter" while the Meter option is switched off) —
     an empty heading with no rows underneath would be more confusing, not less. */
  export function resolveSections(sections: Section[] | null | undefined, shared: Record<string, Token[]> | null | undefined, isSmall: boolean): DisplaySection[] {
    if (!sections) return [];
    return sections.map(function (s): DisplaySection {
      var heading: string | undefined, tokens: Token[];
      if (s.ref) {
        var parts = s.ref.split('.');  /* e.g. ["shared", "layout"] */
        var key = parts[1];
        /* size-aware: substitute -small variants when small size is active */
        if (isSmall && key === 'layout' && shared && shared['layout-small']) {
          key = 'layout-small';
        }
        if (isSmall && key === 'typography' && shared && shared['typography-small']) {
          key = 'typography-small';
        }
        heading = s.heading || key;
        tokens = filterConditionalTokens(shared && shared[key]);
      } else {
        heading = s.heading;
        tokens = filterConditionalTokens(s.tokens);
      }
      return { heading: heading, tokens: applySwatchDefaults(heading, tokens) };
    }).filter(function (s: DisplaySection) { return s.tokens && s.tokens.length; });
  }

  /* format dropdown — switch between CSS and Figma token names.
     Must update every listed token entry in the panel.
     Rule: pass state.lastInspectedEl so getComputedStyle reads from the correct
     element — never pass the Event object as sourceEl. */
  if (tokenFormat) {
    tokenFormat.addEventListener('change', function () {
      updateTokenValues(state.lastInspectedEl);
    });
  }

  /* theme change — refresh swatch colors + CSS values */
  new MutationObserver(function () {
    updateSwatches(state.lastInspectedEl);
    updateTokenValues(state.lastInspectedEl);
  }).observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });