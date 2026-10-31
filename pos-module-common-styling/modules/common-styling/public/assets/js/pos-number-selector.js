/*
  number selector: the stepper buttons, the min / max limits, the filled state and the
  announcement of the new value

  usage:
    new window.pos.modules.numberSelector(container);
    (container: the .pos-number-selector element; init.liquid does this for every number
    selector on the page)
*/



// purpose:   steps the value with the − / + buttons, disables the button at a limit, marks the
//            field filled once the value differs from its starting value, restores the starting
//            value when an emptied field loses focus, and announces the label + value after a
//            button press ("Quantity 7")
// arguments: container with the number input and the two buttons (dom node)
// ************************************************************************
window.pos.modules.numberSelector = function(container){

  // cache 'this' value not to be overwritten later
  const module = this;

  // purpose:   settings that are being used across the module
  // ------------------------------------------------------------------------
  module.settings = {};
  // container for the component (dom node)
  module.settings.container = container;
  // the number input (dom node)
  module.settings.input = container.querySelector('.pos-number-selector-input');
  // the decrease / increase buttons (dom nodes)
  module.settings.decrease = container.querySelector('[data-pos-number-selector-step="-1"]');
  module.settings.increase = container.querySelector('[data-pos-number-selector-step="1"]');
  // the visually hidden live region (dom node, optional)
  module.settings.status = container.querySelector('.pos-number-selector-status');
  // class on the container while the value differs from its starting value (string)
  module.settings.filledClass = 'pos-number-selector--filled';
  // the starting value — the value the field was rendered with (string)
  module.settings.start = module.settings.input ? module.settings.input.defaultValue : '';
  // the field's visible label, read out with the value after a button press: "Quantity 7" (string)
  module.settings.labelText = '';
  if (module.settings.input && module.settings.input.labels && module.settings.input.labels.length) {
    const label = module.settings.input.labels[0];
    module.settings.labelText = (label.querySelector('strong') || label).textContent.trim();
  } else if (module.settings.input && module.settings.input.getAttribute('aria-label')) {
    module.settings.labelText = module.settings.input.getAttribute('aria-label');
  }



  // purpose:   updates the buttons and the filled class from the current value
  // ------------------------------------------------------------------------
  module.update = () => {
    const input = module.settings.input;
    const inert = input.disabled || input.readOnly;
    const value = parseFloat(input.value);
    const min = input.min !== '' ? parseFloat(input.min) : -Infinity;
    const max = input.max !== '' ? parseFloat(input.max) : Infinity;

    if (module.settings.decrease) module.settings.decrease.disabled = inert || (!isNaN(value) && value <= min);
    if (module.settings.increase) module.settings.increase.disabled = inert || (!isNaN(value) && value >= max);

    // compared as numbers: "05" is the same value as "5"
    module.settings.container.classList.toggle(module.settings.filledClass, input.value !== '' && parseFloat(input.value) !== parseFloat(module.settings.start));
  };



  // purpose:   steps the value by one step up or down
  // arguments: direction (1 or -1)
  // ------------------------------------------------------------------------
  module.step = (direction) => {
    const input = module.settings.input;
    if (input.disabled || input.readOnly) return;

    if (direction > 0) input.stepUp(); else input.stepDown();

    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));

    if (module.settings.status) {
      module.settings.status.textContent = module.settings.labelText ? module.settings.labelText + ' ' + input.value : input.value;
    }
  };



  // purpose:   an emptied field returns to its starting value when it loses focus
  // ------------------------------------------------------------------------
  module.restore = () => {
    const input = module.settings.input;
    if (input.value !== '' || input.disabled || input.readOnly) return;
    input.value = module.settings.start;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  };



  // purpose:   initializes the module
  // ------------------------------------------------------------------------
  module.init = () => {
    if (!module.settings.input) return;

    [module.settings.decrease, module.settings.increase].forEach(button => {
      if (!button) return;
      // the buttons never take focus from the number (they are tabindex="-1" anyway)
      button.addEventListener('mousedown', event => event.preventDefault());
      button.addEventListener('click', () => module.step(parseInt(button.dataset.posNumberSelectorStep, 10)));
    });

    module.settings.input.addEventListener('input', module.update);
    module.settings.input.addEventListener('blur', module.restore);

    module.update();
  };



  module.init();

};
