/* ── shared mutable state ──────────────────────────────────────────────────
   ES module bindings are live-read-only for importers (a module that does
   `export let x = 1` can reassign x itself, but `import { x } from './state.js'; x = 2`
   is a SyntaxError for every other module). This file's docs site has ~13 "current
   selection" values read and written from many different per-component control-wiring
   files, so they live as properties on one shared mutable object instead — every module
   mutates `state.x`, never reassigns a binding. Extracted 2026-09-18 from the single
   `styleguide-component-page.js` monolith's ~13 separate `var current*` declarations
───────────────────────────────────────────────────────────────────────────── */
export interface StyleguideState {
  comp: string;
  tokenMap: Record<string, unknown> | null;    /* set by switchComponent */
  tagIntent: string;
  status: string;
  size: string;
  /* kept for updateSwatches/updateTokenValues' theme-change and format-dropdown handlers,
     which pass it as the "read computed style from this element" context — always null now
     that click-to-inspect (the only thing that ever set it) is gone; those calls degrade
     gracefully. */
  lastInspectedEl: HTMLElement | null;
  iconSize: string;
  buttonBase: string;
  /* tracks the currently selected Intent for the button.json spec-driven Tokens/Code panels —
     mirrors exactly what the button-intent control wiring already applies to the preview
     buttons (does not change that logic, only records it): 'default' from the toggle's own
     dataset maps to spec key 'none' */
  buttonIntent: string;
  intent: string;        /* form intent (text-input / textarea / select) — orthogonal to status */
  codeKind: string;       // matches the new Kind toggle's default-active button
  codeVariant: string;    // matches the toggle's default-active button
  codeSize: string;
  codeNumbered: boolean;
}

export const state: StyleguideState = {
  comp: 'button',
  tokenMap: null,
  tagIntent: 'default',
  status: 'normal',
  size: 'default',
  lastInspectedEl: null,
  iconSize: 'm',
  buttonBase: 'primary',
  buttonIntent: 'none',
  intent: 'normal',
  codeKind: 'inline',
  codeVariant: 'dark',
  codeSize: 'default',
  codeNumbered: false,
};
