/*
  Behavior: animated expand / collapse
  ─────────────────────────────────────────────────────────────────────────────
  Adds a smooth height animation to a native <details> element.
  Wraps the non-summary content in a div and animates its height using the
  Web Animations API so flex/grid layout inside the content is unaffected
  during the animation.

  The native open/close mechanism of <details> is preserved — the behavior
  only intercepts the summary click to coordinate timing.

  Usage (JS):
    window.pos.behaviors.expandCollapse(detailsElement, {
      duration: 220,       // animation duration in ms
      easing:   'ease',    // CSS easing value
    });

  Usage (HTML, auto-init):
    <details data-anim-details>
      <summary>Title</summary>
      <p>Content that animates in and out.</p>
    </details>

  Used by: style-guide documentation pages (.styleguide-ds-details)
  Also suitable for: FAQ accordions, collapsible content blocks
*/


window.pos.behaviors = window.pos.behaviors || {};

window.pos.behaviors.expandCollapse = function (details, options) {

  const config = Object.assign({
    duration: 220,
    easing:   'ease',
  }, options);

  const summary = details.querySelector('summary');
  const content = Array.from(details.children).find(el => el.tagName !== 'SUMMARY');
  if (!summary || !content) return;


  // wrap content so we animate the wrapper, not the content itself
  // this prevents flex/grid reflow inside content during the animation
  // -------------------------------------------------------------------------
  const wrapper = document.createElement('div');
  wrapper.style.overflow = 'hidden';
  content.parentNode.insertBefore(wrapper, content);
  wrapper.appendChild(content);


  // animate open or close on summary click
  // -------------------------------------------------------------------------
  summary.addEventListener('click', function (e) {
    e.preventDefault();

    if (details.open) {
      // closing: animate from current height to 0, then remove open attribute
      const h = wrapper.scrollHeight + 'px';
      wrapper.animate(
        [{ height: h }, { height: '0px' }],
        { duration: config.duration, easing: config.easing }
      ).finished.then(function () {
        details.removeAttribute('open');
      });
    } else {
      // opening: set open first so content renders, then animate height
      details.setAttribute('open', '');
      const h = wrapper.scrollHeight + 'px';
      wrapper.animate(
        [{ height: '0px' }, { height: h }],
        { duration: config.duration, easing: config.easing }
      );
    }
  });

};


// auto-init for <details> elements with data-anim-details attribute
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('details[data-anim-details]').forEach(function (el) {
    window.pos.behaviors.expandCollapse(el, {
      duration: parseInt(el.dataset.animDuration, 10) || 220,
      easing:   el.dataset.animEasing || 'ease',
    });
  });
});
