import { tryRefreshInspect } from './refresh-inspect.js';



  /* ── control handler factory ─────────────────────────────────────────────
     Rule: every variant control must (1) update toggle UI, (2) update the
     preview, (3) refresh the inspect panel. registerControl guarantees (3)
     is never skipped. The callback handles (1) and (2).
     Usage: registerControl(containerEl, '[data-xyz-btn]', function (btn) { });
     Note: applyStatus / applyIconSize call tryRefreshInspect internally. */
  export function setActiveToggle(container: HTMLElement | Document | null, attr: string, value: string, activeClass: string): void {
    if (!container) return;
    container.querySelectorAll<HTMLElement>('[' + attr + ']').forEach(function (b) {
      var active = b.getAttribute(attr) === value;
      b.classList.toggle(activeClass, active);
      b.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  }

  export function registerControl(container: HTMLElement | Document | null, btnSelector: string, callback: (btn: HTMLElement) => void): void {
    if (!container) return;
    container.addEventListener('click', function (e) {
      var btn = (e.target as HTMLElement).closest<HTMLElement>(btnSelector);
      if (!btn) return;
      callback(btn);
      tryRefreshInspect();
    });
  }