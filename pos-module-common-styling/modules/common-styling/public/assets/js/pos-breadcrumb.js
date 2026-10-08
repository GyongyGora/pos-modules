/*
  handles the breadcrumb's responsive collapse: watches whether the item list
  overflows its container and toggles .pos-breadcrumb--collapsed accordingly.

  Not auto-loaded — consuming apps load this script themselves and instantiate it
  per breadcrumb instance:
    new window.pos.modules.breadcrumb({ container: document.getElementById('my-breadcrumb') });
*/


window.pos.modules.breadcrumb = function(userSettings){

  // cache 'this' value not to be overwritten later
  const module = this;


  // purpose:		settings that are being used across the module
  // ------------------------------------------------------------------------
  module.settings = {};
  // breadcrumb container — the <nav class="pos-breadcrumb"> itself (dom node)
  module.settings.container = userSettings.container;
  // id used to mark the module (string)
  module.settings.id = userSettings.id || module.settings.container.id;
  // selector for the item list whose overflow is measured (string)
  module.settings.listSelector = userSettings.listSelector || '.pos-breadcrumb-list';
  // class applied once the list no longer fits (string)
  module.settings.collapsedClass = userSettings.collapsedClass || 'pos-breadcrumb--collapsed';
  // to enable debug mode (bool)
  module.settings.debug = (userSettings?.debug) ? userSettings.debug : false;


  // purpose:		initializes the component
  // ------------------------------------------------------------------------
  module.init = () => {
    module.list = module.settings.container.querySelector(module.settings.listSelector);
    if (!module.list) return;

    pos.modules.debug(module.settings.debug, module.settings.id, 'Initializing breadcrumb', module.settings);

    module.observer = new ResizeObserver(module.check);
    module.observer.observe(module.settings.container);
    module.check();
  };


  // purpose:		measures real overflow and toggles the collapsed class
  // ------------------------------------------------------------------------
  module.check = () => {
    module.settings.container.classList.remove(module.settings.collapsedClass);
    if (module.list.scrollWidth > module.list.clientWidth) {
      module.settings.container.classList.add(module.settings.collapsedClass);
      pos.modules.debug(module.settings.debug, module.settings.id, 'Collapsed — list no longer fits its container');
    }
  };


  module.init();

};
