/*
  keeps a slider's fill and value tooltip in sync with its range input

  usage:
    new window.pos.modules.slider(container);
    (container: the .pos-slider-field element; init.liquid does this for every slider on the page)
*/



// purpose:   syncs --ratio (fill + tooltip position) and the tooltip text with the input, and shows
//            the tooltip while the handle is dragged
// arguments: container with the range input (dom node)
// ************************************************************************
window.pos.modules.slider = function(container){

  // cache 'this' value not to be overwritten later
  const module = this;

  // purpose:   settings that are being used across the module
  // ------------------------------------------------------------------------
  module.settings = {};
  // container for the component (dom node)
  module.settings.container = container;
  // the range input (dom node)
  module.settings.input = container.querySelector('.pos-slider');
  // the value tooltip (dom node, optional)
  module.settings.value = container.querySelector('.pos-slider-value');
  // class on the container while the handle is dragged (string)
  module.settings.draggingClass = 'is-dragging';



  // purpose:   writes the input's position into --ratio and the tooltip
  // ------------------------------------------------------------------------
  module.update = () => {
    const input = module.settings.input;
    const min = parseFloat(input.min || 0);
    const max = parseFloat(input.max || 100);
    const ratio = max > min ? (parseFloat(input.value) - min) / (max - min) : 0;
    module.settings.container.style.setProperty('--ratio', String(ratio));
    if (module.settings.value) module.settings.value.textContent = input.value;
  };



  // purpose:   shows the tooltip from pointer down until the pointer is released anywhere
  // ------------------------------------------------------------------------
  module.startDrag = () => {
    if (module.settings.input.disabled) return;
    module.settings.container.classList.add(module.settings.draggingClass);
    const stop = () => {
      module.settings.container.classList.remove(module.settings.draggingClass);
      window.removeEventListener('pointerup', stop);
      window.removeEventListener('pointercancel', stop);
    };
    window.addEventListener('pointerup', stop);
    window.addEventListener('pointercancel', stop);
  };



  // purpose:   initializes the module
  // ------------------------------------------------------------------------
  module.init = () => {
    if (!module.settings.input) return;
    module.update();
    module.settings.input.addEventListener('input', module.update);
    module.settings.input.addEventListener('pointerdown', module.startDrag);
  };



  module.init();

};
