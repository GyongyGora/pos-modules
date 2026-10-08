/*
  Behavior: dismiss / remove container
  ─────────────────────────────────────────────────────────────────────────────
  When a .pos-close button inside a [data-anim-dismiss] container is clicked,
  the container animates out (fade + scale down via .pos-anim-dismiss--out)
  and is then removed from the DOM.

  A pos:dismissed CustomEvent is dispatched on the container just before
  removal — consumers can listen to it for side-effects (show undo, update
  counts, etc.).

  If the container has data-anim-no-remove, the element is NOT removed from
  the DOM after the animation — only the event is fired. Useful for preview
  or undo flows where the element needs to stay accessible.

  Usage (JS):
    window.pos.behaviors.dismiss(containerElement, {
      removeElement: true,   // set false to keep element in DOM (default: true)
    });

  Usage (HTML, auto-init):
    <div data-anim-dismiss>
      <p>This alert can be dismissed.</p>
      <button type="button" class="pos-close" aria-label="Dismiss">...</button>
    </div>

    <!-- keep element in DOM after animation (preview / undo use case) -->
    <li data-anim-dismiss data-anim-no-remove>
      ...
    </li>

  Used by: closeable alerts, dismissible banners, removable tags
*/


window.pos.behaviors = window.pos.behaviors || {};

window.pos.behaviors.dismiss = function (container, options) {
  var config = Object.assign({ removeElement: true }, options);

  var closeBtn = container.querySelector('.pos-close');
  if (!closeBtn) return;

  closeBtn.addEventListener('click', function () {
    container.classList.add('pos-anim-dismiss--out');

    container.addEventListener('animationend', function () {
      container.dispatchEvent(new CustomEvent('pos:dismissed', { bubbles: true }));
      if (config.removeElement !== false) container.remove();
    }, { once: true });
  });
};


// auto-init for [data-anim-dismiss] elements
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('[data-anim-dismiss]').forEach(function (el) {
    window.pos.behaviors.dismiss(el, {
      removeElement: !el.hasAttribute('data-anim-no-remove'),
    });
  });
});
