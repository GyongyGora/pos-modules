/*
  segmented control component

  handles click switching + sliding indicator animation
  sliding indicator logic delegated to pos-behavior-sliding-indicator.js
  auto-initializes all .pos-segmented-control elements on DOMContentLoaded
*/


window.pos.modules.segmentedControl = function(container) {

  const module = this;
  module.container = container;


  // purpose:   delegate indicator tracking to the sliding indicator behavior
  // ------------------------------------------------------------------------
  const indicator = window.pos.behaviors.slidingIndicator(container, {
    activeSelector:    '.pos-segmented-control-btn--active, .pos-segmented-control-btn[aria-pressed="true"]',
    noTransitionClass: 'pos-segmented-control--no-transition',
  });

  module.updateIndicator = indicator.update;


  // purpose:   handle button click — switch active, animate indicator
  // ------------------------------------------------------------------------
  module.bindClicks = () => {
    module.container.querySelectorAll('.pos-segmented-control-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        if (btn.getAttribute('aria-pressed') === 'true') return;

        module.container.querySelectorAll('.pos-segmented-control-btn').forEach(function(b) {
          b.classList.remove('pos-segmented-control-btn--active');
          b.setAttribute('aria-pressed', 'false');
        });

        btn.classList.add('pos-segmented-control-btn--active');
        btn.setAttribute('aria-pressed', 'true');

        module.updateIndicator(true);
      });
    });
  };


  // purpose:   initialize the component
  // ------------------------------------------------------------------------
  module.init = () => {
    module.updateIndicator(false);
    module.container.classList.add('pos-segmented-control--js');
    module.bindClicks();
  };

  module.init();

};


// auto-initialize all segmented controls on page load
document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('.pos-segmented-control').forEach(function(el) {
    new window.pos.modules.segmentedControl(el);
  });
});
