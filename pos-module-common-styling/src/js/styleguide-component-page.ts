/* ── entry point for the /style-guide component-template page ──────────
   Loaded as <script type="module">. Every sibling module below is imported here
   (even ones only needed transitively) so its top-level DOM wiring is guaranteed
   to run exactly once, regardless of the internal import graph between them —
   (split out of the former single ~4450-line styleguide-component-page.js). */
import './styleguide-component-page/outer-scroll-guard.js';
import './styleguide-component-page/core/state.js';
import './styleguide-component-page/core/dom-refs.js';
import './styleguide-component-page/core/dom-utils.js';
import './styleguide-component-page/comp-configs.js';
import './styleguide-component-page/panel-resize.js';
import './styleguide-component-page/preview-stage.js';
import './styleguide-component-page/apply-status.js';
import './styleguide-component-page/core/refresh-inspect.js';
import './styleguide-component-page/controls/status-size-scheme.js';
import './styleguide-component-page/controls/tags-popovers-fields.js';
import './styleguide-component-page/controls/forms-code.js';
import './styleguide-component-page/controls/cards-misc.js';
import './styleguide-component-page/usage-tab.js';
import './styleguide-component-page/token-panel.js';
import './styleguide-component-page/code-snippet.js';
import { switchComponent } from './styleguide-component-page/switch-component.js';
import './styleguide-component-page/scroll-nav.js';


  /* initial render — switch to first component (button) */
  switchComponent('button');

  /* trigger pos-segmented-control to recalculate sliding indicator widths.
     setTimeout(0) ensures this runs AFTER DOMContentLoaded (where the toggle
     group initializes its indicators) — inline scripts register DOMContentLoaded
     listeners before deferred scripts do, so we can't use DOMContentLoaded here. */
  setTimeout(function () {
    window.dispatchEvent(new Event('resize'));
  }, 0);
(function () {
  var btn = document.getElementById('comp-preview-chevron');
  if (!btn) return;
  btn.addEventListener('click', function () {
    var expanded = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', expanded ? 'false' : 'true');
    btn.setAttribute('aria-label', expanded ? 'Expand section' : 'Collapse section');
  });
}());

/* ── dismissible preview items: reset after dismiss ──
   Animation is handled by pos-behavior-dismiss.js (data-anim-dismiss).
   data-anim-no-remove keeps the element in DOM so the reset can restore it.
   We listen for the pos:dismissed event to show the reset button.
   Shared by the removable Tag preview and all four Toast intent previews
   (2026-09-03) — same wiring, different element ids.                     ── */
function wireDismissReset(itemId: string, resetId: string): void {
  var item  = document.getElementById(itemId) as HTMLElement | null;
  var reset = document.getElementById(resetId) as HTMLElement | null;
  if (!item || !reset) return;

  item.addEventListener('pos:dismissed', function () {
    item!.hidden = true;
    reset!.hidden = false;
  });

  var resetBtn = reset.querySelector<HTMLElement>('button') as HTMLButtonElement;
  resetBtn.addEventListener('click', function () {
    item!.classList.remove('pos-anim-dismiss--out');
    item!.hidden = false;
    reset!.hidden = true;
  });
}

wireDismissReset('comp-removable-tag-item', 'comp-removable-tag-reset');
['success', 'warning', 'error', 'info'].forEach(function (variant) {
  wireDismissReset('comp-toast-' + variant, 'comp-toast-' + variant + '-reset');
});

/* ── real popovers in the previews (Dropdown button, collapsed Breadcrumb): run the Popover
   module on them, as init does in apps — keyboard navigation, focus handling. The Popover /
   Popover menu previews are static stand-ins without [popovertarget], so they are skipped. ── */
(function () {
  if (!window.pos || !window.pos.modules || !window.pos.modules.popover) return;
  document.querySelectorAll<HTMLElement>('.comp-preview-stage .pos-popover, .comp-preview-stage .pos-dropdown-button').forEach(function (el) {
    var popoverEl = el.querySelector<HTMLElement>('[popover]');
    if (!popoverEl || !el.querySelector('[popovertarget]')) return;
    window.pos.modules.active[popoverEl.id] = new window.pos.modules.popover(el);
  });
}());

/* ── collapsible list preview: initialize the pos-collapsible module ── */
(function () {
  var demo = document.getElementById('comp-collapsible-list-demo');
  if (!demo || !window.pos || !window.pos.modules || !window.pos.modules.collapsible) return;
  new window.pos.modules.collapsible({ container: demo });
}());