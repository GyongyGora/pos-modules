/*
  Behavior: sliding indicator
  ─────────────────────────────────────────────────────────────────────────────
  Moves a CSS-driven sliding indicator to track the active item inside a
  container. Sets two CSS custom properties on the container:
    --indicator-x   left offset of the active item (px)
    --indicator-w   width of the active item (px)

  The CSS is responsible for rendering the indicator using these vars.
  Recalculates on window resize so the indicator stays correct after layout
  shifts, font-size changes, or viewport resizes.

  Usage (from a component module):
    window.pos.behaviors.slidingIndicator(container, {
      activeSelector:   '[aria-pressed="true"]',
      noTransitionClass: 'my-component--no-transition',
    });

  Auto-init via data attribute (HTML):
    <div data-sliding-indicator
         data-active-selector=".my-btn--active"
         data-no-transition-class="my-component--no-transition">
    </div>

  Used by: pos-toggle-group.js, pos-segmented-control.js
*/


window.pos.behaviors = window.pos.behaviors || {};

window.pos.behaviors.slidingIndicator = function (container, options) {

  const config = Object.assign({
    activeSelector:    '[aria-pressed="true"]',
    noTransitionClass: null,
  }, options);


  // update — measure active item and push to CSS vars
  // -------------------------------------------------------------------------
  function update(animate) {
    const active = container.querySelector(config.activeSelector);
    if (!active) return;

    if (!animate && config.noTransitionClass) {
      container.classList.add(config.noTransitionClass);
    }

    container.style.setProperty('--indicator-x', active.offsetLeft + 'px');
    container.style.setProperty('--indicator-w', active.offsetWidth + 'px');

    if (!animate && config.noTransitionClass) {
      container.offsetHeight; // force reflow before re-enabling transition
      container.classList.remove(config.noTransitionClass);
    }
  }


  // init
  // -------------------------------------------------------------------------
  update(false);
  window.addEventListener('resize', () => update(false));

  return { update };

};


// auto-init for elements with data-sliding-indicator attribute
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('[data-sliding-indicator]').forEach(function (el) {
    window.pos.behaviors.slidingIndicator(el, {
      activeSelector:    el.dataset.activeSelector    || '[aria-pressed="true"]',
      noTransitionClass: el.dataset.noTransitionClass || null,
    });
  });
});
