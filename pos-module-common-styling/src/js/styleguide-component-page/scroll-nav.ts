import { mainContent, tokenPanelBody } from './core/dom-refs.js';
import { switchComponent } from './switch-component.js';



  /* "Composed of" chips (rendered at the bottom of the Tokens panel, see renderTokenPanel) —
     jump to the nested component's own section instead of duplicating its tokens here. */
  if (tokenPanelBody) {
    tokenPanelBody.addEventListener('click', function (e) {
      var chip = (e.target as HTMLElement).closest<HTMLElement>('[data-composed-of-key]');
      if (!chip) return;
      scrollToSectionHash('#comp-section-' + chip.dataset.composedOfKey);
    });
  }

  /* ── scroll-sync — switch right panel on scroll ──────────────────
     On every scroll tick, find the last section whose top edge is
     above 35% of the scroll container height. This works identically
     when scrolling up or down: whichever section "owns" that line is
     the active one.
  ─────────────────────────────────────────────────────────────────── */
  export var compSections = document.querySelectorAll<HTMLElement>('[data-comp-key]');
  if (compSections.length > 0 && mainContent) {
    var scrollTicking = false;

    function syncActiveComponent() {
      var containerTop = mainContent.getBoundingClientRect().top;
      var threshold = mainContent.offsetHeight * 0.35; /* 35% down from visible top */
      var activeSection: HTMLElement | null = null;
      compSections.forEach(function (s) {
        var sTop = s.getBoundingClientRect().top - containerTop;
        if (sTop <= threshold) activeSection = s;
      });
      if (activeSection) switchComponent(activeSection.dataset.compKey);
    }

    mainContent.addEventListener('scroll', function () {
      if (scrollTicking) return;
      scrollTicking = true;
      requestAnimationFrame(function () {
        scrollTicking = false;
        syncActiveComponent();
      });
    }, { passive: true });

    /* Belt-and-suspenders: a smooth-scroll animation (e.g. from clicking a sidebar link) fires
       many 'scroll' ticks while still in flight, each RAF-throttled above. The very last tick
       to actually run can land slightly before the animation's true rest position — for two
       closely-spaced sections (e.g. Card / Dialog in "Complex components"), that's sometimes
       enough for the 35%-threshold math to pick the section just *before* the real destination,
       and since no further 'scroll' event fires once the animation genuinely stops, nothing
       ever corrects it — the right panel stays "one section behind" what's actually on screen
       (found 2026-09-18, via a Playwright test landing on Card's state controls immediately
       after navigating to Dialog). 'scrollend' fires once, after scrolling has truly settled,
       so re-running the same sync here catches and fixes exactly that mismatch. */
    mainContent.addEventListener('scrollend', syncActiveComponent, { passive: true });

    /* run once on load to set initial state */
    syncActiveComponent();
  }

  /* ── sidebar nav hash scrolling ─────────────────────────────────
     Sidebar links like /style-guide/component-template#comp-section-button
     should scroll mainContent to the target section, not the window.
     • On load: if a hash is present, scroll to the section.
     • On click: intercept same-page hash links and scroll manually.
  ─────────────────────────────────────────────────────────────────── */
  export function scrollToSectionHash(hash: string) {
    if (!hash) return;
    var id = hash.replace('#', '');
    var target = document.getElementById(id);
    if (target && mainContent) {
      /* Explicitly scroll mainContent — scrollIntoView does not reliably
         target mainContent because the browser may attempt to scroll
         body/window (which is overflow:hidden and cannot scroll).
         getBoundingClientRect gives the correct position relative to the
         visible scroll container regardless of offsetParent chain. */
      var containerTop = mainContent.getBoundingClientRect().top;
      var targetTop = target.getBoundingClientRect().top;
      var newScrollTop = mainContent.scrollTop + (targetTop - containerTop);
      mainContent.scrollTo({ top: Math.max(0, newScrollTop), behavior: 'smooth' });
      if (target.dataset.compKey) switchComponent(target.dataset.compKey);
      /* The target offset above is computed once, before the smooth-scroll animation starts —
         but the scroll-sync 'scroll'/'scrollend' listeners further down fire switchComponent()
         for whichever section the 35%-threshold math picks at each tick *while the animation is
         still in flight*, and each of those calls can itself reset a passed-through section's
         preview to a slightly different height (e.g. a select's "opened" or an input's "filled"
         state reverting to normal). Over a long jump (many sections passed through, e.g. from
         Avatar all the way down to Dialog) those small shifts add up enough that the original,
         one-time target offset above under/overshoots the real final position by a large margin
         — found 2026-09-18: navigating straight to Dialog landed on Card's right-panel controls
         instead, ~1180px short. Once the animation genuinely settles, re-assert the *explicit*
         navigation target here — the user's actual click intent — rather than trusting whatever
         the passive scroll-sync last computed while still mid-flight. */
      if (target.dataset.compKey) {
        mainContent.addEventListener('scrollend', function () {
          switchComponent(target.dataset.compKey);
        }, { once: true });
      }
    }
  }

  /* initial hash on page load */
  if (window.location.hash) {
    setTimeout(function () { scrollToSectionHash(window.location.hash); }, 80);
  }

  /* intercept sidebar anchor clicks to keep scroll inside mainContent */
  document.querySelectorAll<HTMLElement>('.styleguide-ds-sidebar a[href*="#comp-section-"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      var href = link.getAttribute('href');
      var hash = '#' + href.split('#')[1];
      history.replaceState(null, '', hash);
      scrollToSectionHash(hash);
    });
  });