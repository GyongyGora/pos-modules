/*
  Behavior: smooth scroll to anchor
  ─────────────────────────────────────────────────────────────────────────────
  Scrolls a specific container element (not the window) to a target element
  with smooth behavior. Intercepts same-page anchor clicks so the scroll
  happens inside the container rather than the browser's default window scroll.

  Designed for single-page layouts with a custom scrollable content area,
  e.g. a documentation page where only the center column scrolls, not the
  window or the sidebar.

  Usage (JS):
    const scroller = window.pos.behaviors.smoothScroll(scrollContainer, {
      // optional: intercept anchor clicks inside this element
      linkScope:  document.querySelector('.my-sidebar'),
      // optional: called after scroll completes (hash string passed)
      onScroll:   function(hash) { ... },
      // optional: delay before scrolling on page load (ms)
      initDelay:  80,
    });

    // programmatic scroll:
    scroller.scrollTo('#my-section');

  Usage (HTML, auto-init):
    <div data-smooth-scroll
         data-scroll-link-scope=".styleguide-ds-sidebar"
         data-scroll-init-delay="80">
    </div>
    Links inside the scope that contain '#' are intercepted automatically.

  Used by: component documentation pages (main content scroll area)
*/


window.pos.behaviors = window.pos.behaviors || {};

window.pos.behaviors.smoothScroll = function (scrollContainer, options) {

  const config = Object.assign({
    linkScope:  null,
    onScroll:   null,
    initDelay:  80,
  }, options);


  // scroll to a target identified by hash string ('#section-id') or element
  // -------------------------------------------------------------------------
  function scrollTo(target) {
    const el = typeof target === 'string'
      ? document.getElementById(target.replace('#', ''))
      : target;
    if (!el || !scrollContainer) return;

    scrollContainer.scrollTo({ top: el.offsetTop, behavior: 'smooth' });

    if (config.onScroll) {
      config.onScroll(typeof target === 'string' ? target : '#' + el.id);
    }
  }


  // intercept same-page anchor clicks inside linkScope
  // -------------------------------------------------------------------------
  function interceptLinks(scope) {
    scope.querySelectorAll('a[href*="#"]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        const href = link.getAttribute('href');
        const hashIndex = href.indexOf('#');
        if (hashIndex === -1) return;
        const hash = href.slice(hashIndex);
        // only intercept if target exists in this document
        const target = document.getElementById(hash.replace('#', ''));
        if (!target) return;
        e.preventDefault();
        history.replaceState(null, '', hash);
        scrollTo(hash);
      });
    });
  }


  // scroll to hash present in URL on page load
  // -------------------------------------------------------------------------
  if (window.location.hash) {
    setTimeout(function () {
      scrollTo(window.location.hash);
    }, config.initDelay);
  }

  if (config.linkScope) {
    interceptLinks(config.linkScope);
  }


  // return public API
  // -------------------------------------------------------------------------
  return { scrollTo };

};


// auto-init for elements with data-smooth-scroll attribute
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('[data-smooth-scroll]').forEach(function (el) {
    const scopeSelector = el.dataset.scrollLinkScope;
    window.pos.behaviors.smoothScroll(el, {
      linkScope:  scopeSelector ? document.querySelector(scopeSelector) : null,
      initDelay:  parseInt(el.dataset.scrollInitDelay, 10) || 80,
    });
  });
});
