/*
  Behavior: drag-to-resize
  ─────────────────────────────────────────────────────────────────────────────
  Attaches pointer-event drag handling to a resize handle element.
  On drag, sets a CSS custom property on the target element so CSS can
  use it for width, height, min-height, or any size-related property.

  The behavior only manages the measurement and the CSS var — all visual
  sizing must be done in CSS via the custom property.

  Usage (JS):
    window.pos.behaviors.resize(handle, target, {
      axis:          'x',              // 'x' (width) or 'y' (height)
      cssVar:        '--panel-width',  // custom property set on target
      minSize:       200,              // minimum px
      maxSize:       null,             // maximum px (null = no limit)
      direction:     -1,              // -1: drag left/up = grow, 1: drag right/down = grow
      draggingClass: 'is-dragging',   // class added to handle + body during drag
    });

  Usage (HTML, auto-init):
    <div data-resize-handle
         data-resize-target="#my-panel"
         data-resize-axis="x"
         data-resize-css-var="--panel-width"
         data-resize-min="200"
         data-resize-max="600"
         data-resize-direction="-1">
    </div>

  CSS example:
    #my-panel { width: var(--panel-width, 320px); }

  Used by: component documentation pages (right panel resize)
  Also suitable for: textarea grow handle, split-pane layouts
*/


window.pos.behaviors = window.pos.behaviors || {};

window.pos.behaviors.resize = function (handle, target, options) {

  const config = Object.assign({
    axis:          'x',
    cssVar:        '--resize-size',
    minSize:       100,
    maxSize:       null,
    direction:     -1,
    draggingClass: 'is-dragging',
  }, options);

  let isDragging   = false;
  let startPos     = 0;
  let startSize    = 0;
  let rafPending   = false;


  // clamp value between min and optional max
  // -------------------------------------------------------------------------
  function clamp(value) {
    const min = config.minSize;
    const max = config.maxSize !== null
      ? config.maxSize
      : (config.axis === 'x' ? window.innerWidth : window.innerHeight);
    return Math.max(min, Math.min(max, value));
  }


  // get current size of target along the configured axis
  // -------------------------------------------------------------------------
  function currentSize() {
    return config.axis === 'x' ? target.offsetWidth : target.offsetHeight;
  }


  // drag start
  // -------------------------------------------------------------------------
  handle.addEventListener('pointerdown', function (e) {
    if (e.button !== 0) return; // left button only
    isDragging = true;
    startPos   = config.axis === 'x' ? e.clientX : e.clientY;
    startSize  = currentSize();
    handle.classList.add(config.draggingClass);
    document.body.classList.add(config.draggingClass);
    document.body.style.cursor     = config.axis === 'x' ? 'col-resize' : 'row-resize';
    document.body.style.userSelect = 'none';
    handle.setPointerCapture(e.pointerId);
    e.preventDefault();
  });


  // drag move — throttled to one RAF per frame
  // -------------------------------------------------------------------------
  handle.addEventListener('pointermove', function (e) {
    if (!isDragging) return;
    if (rafPending) return;
    rafPending = true;

    requestAnimationFrame(function () {
      rafPending = false;
      const pos  = config.axis === 'x' ? e.clientX : e.clientY;
      const diff = (startPos - pos) * config.direction;
      const size = clamp(startSize + diff);
      target.style.setProperty(config.cssVar, size + 'px');
      // keep layout-dependent components in sync
      window.dispatchEvent(new Event('resize'));
    });
  });


  // drag end
  // -------------------------------------------------------------------------
  handle.addEventListener('pointerup', function () {
    if (!isDragging) return;
    isDragging = false;
    handle.classList.remove(config.draggingClass);
    document.body.classList.remove(config.draggingClass);
    document.body.style.cursor     = '';
    document.body.style.userSelect = '';
    window.dispatchEvent(new Event('resize'));
  });


  // return public API
  // -------------------------------------------------------------------------
  return {
    getSize: currentSize,
  };

};


// auto-init for elements with data-resize-handle attribute
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('[data-resize-handle]').forEach(function (el) {
    const targetEl = document.querySelector(el.dataset.resizeTarget);
    if (!targetEl) return;

    window.pos.behaviors.resize(el, targetEl, {
      axis:          el.dataset.resizeAxis      || 'x',
      cssVar:        el.dataset.resizeCssVar    || '--resize-size',
      minSize:       parseInt(el.dataset.resizeMin, 10) || 100,
      maxSize:       el.dataset.resizeMax ? parseInt(el.dataset.resizeMax, 10) : null,
      direction:     parseInt(el.dataset.resizeDirection, 10) || -1,
      draggingClass: el.dataset.resizeDraggingClass || 'is-dragging',
    });
  });
});
