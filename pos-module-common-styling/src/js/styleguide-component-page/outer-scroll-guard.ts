

  /* ── neutralize the browser's native #hash anchor-jump on load ──────────
     When the URL already has a #comp-section-* fragment on load (e.g. a
     sidebar link, a bookmark, a page refresh), the browser's own native
     "scroll the target into view" behavior fires on <html> itself — despite
     `.pos-app { overflow: hidden }` on <html>/<body>, which blocks *user*
     scrolling but does not block this native programmatic scroll. This runs
     independently of (and before) this file's own scrollToSectionHash()
     below, which correctly scrolls #main-content instead — so both fire,
     and the whole fixed-height (100dvh) layout shifts up by the native
     jump's offset, taking the right sidebar's tabs off-screen with it.
     Force the outer scroll back to 0 on every tick this can plausibly fire
     on; #main-content's own scroll position is untouched by any of this. */
  (function () {
    var resetOuterScroll = function () {
      if (window.scrollY !== 0) window.scrollTo(0, 0);
      if (document.documentElement.scrollTop !== 0) document.documentElement.scrollTop = 0;
      if (document.body.scrollTop !== 0) document.body.scrollTop = 0;
    };
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    resetOuterScroll();
    document.addEventListener('DOMContentLoaded', resetOuterScroll);
    window.addEventListener('load', resetOuterScroll);
    /* Belt-and-suspenders: neither the load-time resets above, nor CSS
       `overflow-anchor: none`, fully stopped this in testing — the jump can
       land seconds after load too, e.g. when a focusable form control deep
       in #main-content (Switch button / Toggle button checkboxes) receives
       focus from a click while a #comp-section-* hash is still in the URL —
       something (still not root-caused with certainty) scrolls <html> in
       response. This used to be removed 5s after load, which is exactly why
       clicking Switch/Toggle button still triggered it (well past 5s into
       any real page visit). Since this page's outer scroll (window/html/body)
       is never legitimately supposed to move at all — the app's own
       scroll-sync exclusively targets #main-content — keep enforcing 0 for
       the entire lifetime of the page instead of a fixed window. */
    window.addEventListener('scroll', resetOuterScroll, { passive: true });
    document.addEventListener('scroll', resetOuterScroll, { capture: true, passive: true });
  })();