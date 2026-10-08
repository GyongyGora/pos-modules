# platformOS Common-Styling Module

> [!IMPORTANT]
> 🤖 **An AI-native design system, optimized for UI generation by coding agents.** Every component, token and rule is published in a machine-readable form — a component catalog (`tokens/ds-index.json`), a per-component token spec (`tokens/components/*.json`), [AGENTS.md](AGENTS.md) and [llms.txt](llms.txt) — so agents like Claude Code, Cursor or Copilot build interfaces from the real DS components and tokens instead of guessing. Built-in checks (`npm run check`) and review skills verify the generated UI: real classes and tokens, contrast in every color mode, layout and accessibility.

The Common-Styling module provides a reusable design system for platformOS to make your projects look great out of the box and gives you simple tools to customize them.

It includes reusable CSS and JavaScript that are (or will be) leveraged by [platformOS modules](https://documentation.platformos.com/developer-guide/modules/platformos-modules#our-modules), and which you can also use directly in your own projects. The idea is to provide a consistent, documented way of building modules that look good from the start and which you can easily customize to fit your needs.

Common-styling follows the [platformOS DevKit best practices](https://documentation.platformos.com/developer-guide/modules/platformos-modules).

> **Version 2.0** is the new, refreshed design system — built on the 1.x design system and carrying it forward: the same `pos-` class names and `init` call, with new tokens and color scales, light / dark / high contrast modes, brand themes, and rebuilt, documented components. The 1.x version stays on the `master` branch. Moving an app over: [MIGRATION.md](MIGRATION.md).

📖 **Documentation site (preview instance):** https://gyongy-design-system.staging.oregon.platform-os.com/style-guide/overview

## Features

- ⚙️ Token-based: primitive → semantic → component CSS variables (`pos-primitives.css`, `pos-config.css`), customizable per app
- 🎚️ 10-step color scales (brand primary, brand supplementary, red, yellow, green — generated in OKLCH): every step has the same contrast target on every scale, so swapping a scale or a brand theme keeps text and graphics accessible without re-checking each color
- 📖 Built-in `/style-guide` documentation site: foundations (tokens, palettes, typography, icons, elevation, interactions), every component with its variants, usage and tokens, themes and a migration plan
- 🧩 Provides shared CSS and JavaScript utilities for use in platformOS modules and projects
- 📝 Includes base styles for forms, buttons, typography, and other common components
- 🛡️ Scoped with `pos-` prefixes and CSS layers to avoid conflicts with project code
- 🌙 Built-in color modes: light, dark and high contrast (follow the OS or set manually), switchable per page section too (`pos-scheme-*`)
- 🎨 15 ready-made themes (Default plus 14 `pos-brand-<key>` classes) and a Themes page that exports your own theme as CSS
- ✏️ Wireframe mode (`pos-brand-wireframe pos-style-wireframe`): black-and-white, hand-drawn look for prototypes and early concepts
- 🧪 Component wizard (`tools/component-wizard.html`): drafts a new component with the real DS styles and tokens in the browser — no server, build or deploy — before it goes into the docs site
- ♿ Built for WCAG 2.2 AA: contrast checked in every mode and theme, keyboard and screen-reader support
- 🤖 Machine-readable catalog for AI coding agents (`AGENTS.md`, `llms.txt`, `tokens/ds-index.json`)
- 📱 Responsive styles included by default
- ✅ Follows [platformOS DevKit best practices](https://documentation.platformos.com/developer-guide/modules/platformos-modules)

## Installation

The platformOS Common Styling Module is available on the [Partner Portal Modules Marketplace](https://partners.platformos.com/marketplace/pos_modules/154).

After installation (and `pos-cli deploy`), the documentation site is available on your own instance at `/style-guide` — the same pages as the live site linked above.

### Prerequisites

Before installing the module, ensure that you have [pos-cli](https://github.com/Platform-OS/pos-cli) installed. This tool is essential for managing and deploying platformOS projects.

The platformOS Common Styling is fully compatible with [platformOS Check](https://github.com/Platform-OS/platformos-lsp#platformos-check----a-linter-for-platformos), a linter and language server that supports any IDE with Language Server Protocol (LSP) integration. For Visual Studio Code users, you can enhance your development experience by installing the [VSCode platformOS Check Extension](https://marketplace.visualstudio.com/items?itemName=platformOS.platformos-check-vscode).

### Installation Steps

1. **Navigate to your project directory** where you want to install the Common Styling Module.

2. **Run the installation command**:

```bash
   pos-cli modules install common-styling
```

This command installs the Common Styling Module and updates or creates the `app/pos-modules.json` file in your project directory to track module configurations.

3. **Explore the documentation site.**
After `pos-cli deploy`, visit `/style-guide` on your instance:
- every component with its variants, usage guidance and tokens
- foundations: tokens, palettes, typography, icons, elevation, interactions
- themes and the migration plan from 1.x


### Setup

1. **Install the module** using the [pos-cli](https://github.com/Platform-OS/pos-cli).

2. **Include the following partial** into your [layout](https://documentation.platformos.com/developer-guide/pages/layouts)'s `<head>` section:

```liquid
{% render 'modules/common-styling/init' %}
```

👉 If you do not have a layout, check the [style-guide's layout](modules/common-styling/public/views/layouts/style-guide.liquid) for an example of a minimal layout.

3. **Scope the styling with `pos-app`:**
- To apply common-styling globally, add `class="pos-app"` to your application’s `<html>` tag:

```html
<html lang="en" class="pos-app">
```
- To apply styles only in certain parts of your app, wrap content in a container:

```html
<div class="pos-app">
</div>
```

4. Ensure you configured your [Instance](https://documentation.platformos.com/developer-guide/glossary#instance) to escape output instead of sanitizing through [app/config.yml](https://documentation.platformos.com/developer-guide/platformos-workflow/directory-structure/config)

```yaml
---
escape_output_instead_of_sanitize: true
---
```

5. **Optionally enable the [CSS reset](modules/common-styling/public/assets/style/pos-reset.css)**. It resets default browser styling and fixes some browser-specific issues
- It’s safe to use in a fresh app.
- In an existing app, enabling it might cause unexpected changes.

To use it, pass the `reset: true` parameter to the render tag mentioned above and use a `pos-app` class anywhere on your main content container:

```liquid
{% render 'modules/common-styling/init', reset: true %}
```

> **Note:** If you plan to add your own CSS overrides, always load them **after** `common-styling` in your layout. This way, your styles take precedence over the defaults.

> **Fonts:** `init` loads Google Sans, Inter, Monda and Roboto Mono from Google Fonts (fonts.googleapis.com). If your app must not contact Google (e.g. GDPR policy), self-host these fonts and render your own `@font-face` rules instead.

## Customizing CSS

When using the `common-styling` module, you can configure the look of components by overriding the CSS variables defined in **`pos-config.css`**.  
Define overrides inside `:root {}` so they apply globally across your app.
Instead of editing the module directly, you can override only the variables you need in your own stylesheet.

👉 Copy only the variables you want to change into your app’s CSS file, and redefine them there.

👉 Use `/style-guide` (Foundations › Tokens) as your main reference for the available variables and the component pages for their classes. It’s the recommended way to discover what you can override.

👉 Common-styling is responsive out of the box. To test layouts, use your browser’s responsive design mode (DevTools → device toolbar).


### 1. Create a custom stylesheet

Add a file to your project, for example:

```text
app/assets/<my-app-name>-config.css
```

This is where you’ll put your overrides.

### 2. Load it after common-styling

In your layout (for example: `application.liquid`), include your stylesheet **below** the `common-styling` init. This ensures your overrides take precedence.

```liquid
{% render 'modules/common-styling/init' %}
<link rel="stylesheet" href="{{ '<my-app-name>-config.css' | asset_url }}">
```

### 3. Override variables

Copy only the variables you want to change from `pos-config.css` into your stylesheet, and redefine them under `:root`.

Example — giving primary buttons a green theme:

```css
:root {
  --pos-color-button-primary-background: #008000;
  --pos-color-button-primary-hover-background: #00a000;
}
```

### Tips and Best practices

- Don’t hardcode values like colors or sizes (with very few exceptions). Always rely on the provided CSS variables.
- Override **only what you need** — don’t copy the full config.
- You can use CSS functions like `calc()`, `from-color()`, or `color-mix()` if you need to adjust variables dynamically.
- Stick to the provided variable system — its names map one-to-one to the design system's Figma variables.
- If your app supports **dark mode** or **high contrast**, override the matching mode variables too (`--pos-color-dark-*`, `--pos-color-a11y-*`).
- Use `/style-guide` to preview available variables and confirm your overrides.


## Dark mode, high contrast and brand themes

The `common-styling` module includes three color modes: light (default), dark and high contrast.

### Automatic dark mode

To enable automatic dark mode (switches based on the user’s system preference), add the following class to the root `<html>` tag in your layout:

```html
<html class="pos-app pos-theme-darkEnabled">
```

### Manual dark mode

If you want to control the theme manually, use:

```html
<html class="pos-app pos-theme-dark pos-theme-darkEnabled">
```

This forces the dark theme regardless of system settings.

### High contrast mode

```html
<html class="pos-app pos-theme-a11y pos-theme-a11yEnabled">
```

Black and white with high-visibility interactive colors, no shadows — for users who need stronger contrast.

### Brand themes

Add `pos-brand-<key>` to the `<html>` tag to swap the brand color scales (light, dark and high contrast follow). The available themes, a live preview and a CSS export of your own theme are on the `/style-guide` Themes page.

### Notes

- Both light and dark themes use the same set of CSS variables. If you override variables, make sure to provide values for both themes if needed.
- You can preview dark mode in your browser [using Chrome DevTools rendering emulation](https://developer.chrome.com/docs/devtools/rendering/emulate-css), toggling system preferences, or manually applying `pos-theme-dark pos-theme-darkEnabled`.
- `pos-scheme-light` / `pos-scheme-dark` / `pos-scheme-a11y` on any element put just that part of the page in another mode.
- Example — overriding variables just for dark mode:

```css
:root {
  --pos-color-dark-button-primary-background: #004d00;
}
```


## Scoping CSS

To avoid conflicts and keep styles predictable, all CSS in this module follows a **scoping** convention.

When naming your module CSS files, please prefix them with `pos-` for consistency.

### Naming conventions

- **Files:** Prefix module CSS files with `pos-` (e.g., `pos-forms.css`, `pos-button.css`) for consistency.
- **Classes:** Prefix CSS classes with `pos-` (e.g., `.pos-form`, `.pos-button`). This ensures styles from `common-styling` won’t interfere with unrelated CSS in your project.

👉 Keep in mind that the module can be used in various contexts, so any styling needs to be scoped just to the module code.

### CSS layers

All styles from `common-styling` are placed inside a dedicated CSS layer.
This lowers specificity so you can override them easily in your own stylesheet, without having to worry about the selectors used.

### Scoped styling

Some CSS rules will be inherited when the parent container has a specific class. For example, the `.pos-form` scopes styling so that inputs, buttons, and other form-related elements inside the container adopt the design system styles.

### Component structure

**Each component should have its own separate CSS file.** This keeps the codebase modular, easier to maintain, and consistent across projects.

For example:

- `pos-forms.css` for forms
- `pos-button.css` for buttons
- `pos-card.css` for cards

## JavaScript namespace for modules

Use ESM Modules to build JavaScript.

The modules should not pollute the global JavaScript namespace. For this purpose, we are using the `pos` namespace attached to the global `window` object. Extending the namespace is the preferred way to store all the needed data, translations, and module public interface.

There are several basic objects used across the modules that could be extended for consistency. Those are shared across many modules, so **remember not to overwrite them in your code** and extend the objects instead.

| object     | description                                    |
|------------|------------------------------------------------|
| window.pos | Global namespace for all module-related data. |
| window.pos.modules | If your module provides a public API or a constructor, then you should attach it to this object, namespacing your module accordingly: `window.pos.modules.myModule = {}` |
| window.pos.modules.active | If your module creates a separate instance and provides a public API, it can be attached to this object. |
| window.pos.profile | Stores all the profile-related data for the currently logged-in user. |
| window.pos.translations | If your JavaScript code needs access to any translations, you should append them to this object. |

As an example starting point for defining JavaScript for your module, you can use the following code:

```html
<script>
  /* namespace */
  if(typeof window.pos !== 'object'){
    window.pos = {};
    window.pos.modules = {};
    window.pos.translations = {};
  }

  /* profile namespace */
  if(typeof window.pos.profile !== 'object'){
    window.pos.profile = {};
  }

  window.pos.profile.myProfileVariable = 'foo';

  /* translations used in module */
  window.pos.translations = {
    ...window.pos.translations,
    myTranslation: 'bar'
  }
</script>
```

## Debugging JavaScript modules

To enable debug mode, you can set the `pos.debug` to `true` in the JS Console. This will log events from the default provided modules.

When building your module, please use the following method to log debug data:

```js
pos.modules.debug(enabled, moduleId, message, data); // data is optional
```

## Module communication using events

To provide a way of reacting to your module changes, please use JavaScript events when appropriate, prefixing the event with `pos-` as follows:

```js
document.dispatchEvent(new CustomEvent('pos-somethingHappenedInMyModule', { bubbles: true, detail: { something: 'new value' } }));
pos.modules.debug(module.settings.debug, 'event', `pos-somethingHappenedInMyModule`, { something: 'new value' });
```

Using `pos.modules.debug()` to add information about the event provides an easy way for the developers to react to changes provided by your module without the need to check the code or browse through documentation.

## Building dependencies

Rollup is used to build dependencies from NPM registry. To add a new dependency:

1. Use `npm install [package]` as you would normally do
2. Create new JS file in `src/js/` named `dependency-[package name].js`
3. In that file use the needed `import` statements
4. Use `npm run build` to generate the build files for each dependency in `modules/common-styling/public/assets/js`
5. Use `modules/common-styling/public/views/partials/init.liquid` to load your dependency using async `import()` function

## Using JavaScript modules

After adding the code for your module in `modules/common-styling/public/assets/js/` use the async `import()` function to load them and assign their instances to `pos.modules.active` namespace depending on if they are needed on the page. For example let's load a collapsible list module only when there is such list on the page:

```js
/* collapsible lists */
if(document.querySelector('.pos-collapsible')){
  import('{{ 'modules/common-styling/js/pos-collapsible.js' | asset_url }}').then(module => {
    document.querySelectorAll('.pos-collapsible').forEach((element, index) => {
      window.pos.modules.active[element.id || `pos-collapsible-${index}`] = new window.pos.modules.collapsible({
        container: element,
        id: element.id || `pos-collapsible-${index}`
      });
    });
  });
};
```

## Handling cache with importmaps

When using the `import` statement in your JavaScript files, you will request a JS file from the CDN that could already be cached by the browser. platformOS handles breaking the cache for assets by using the `asset_url` filter. You cannot use it in the JS files, though, but the browsers allow you to map any filename to any other URL using [Import Maps](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script/type/importmap). Use one import map per page, defined before any module script.

An example import map looks like this:

```html
<script type="importmap">
  {
    "imports": {
      "/": "{{ 'modules/chat/js/' | asset_url }}",
      "chat.js": "{{ 'modules/chat/js/chat.js' | asset_url }}",
      "consumer.js": "{{ 'modules/chat/js/consumer.js' | asset_url }}",
      "csrfToken.js": "{{ 'modules/chat/js/csrfToken.js' | asset_url }}",
      "notifications.js": "{{ 'modules/chat/js/notifications.js' | asset_url }}",
      "./": "./"
    }
  }
</script>
```

The first line allows you to use relative `import` statements inside your JS files, the last line resets it back to the default.

## JavaScript components

### Toast notifications

1. Render the partial in your application layout (preferably at the very bottom)

```liquid
{% liquid
  function flash = 'modules/core/commands/session/get', key: 'sflash'
  if context.location.pathname != flash.from or flash.force_clear
    function _ = 'modules/core/commands/session/clear', key: 'sflash'
  endif
  render 'modules/common-styling/toasts', params: flash
%}
```

From JavaScript, you can use:

```js
new pos.modules.toast('success', 'Saved');                  // severity: success | error | info | warning
new pos.modules.toast('error', 'Could not save', { icon: true, autohide: false, delay: 0 });
```

Options: `icon` (show the severity icon, default `false`), `autohide` (default `true` for success only), `delay` (ms before it appears).

On the server side, store the message in the session before redirecting; the toasts partial above shows it on the next page:

```liquid
{% liquid
  assign flash = {"message": "Saved", "severity": "success", "from": context.location.pathname}
  function _ = 'modules/core/commands/session/set', key: 'sflash', value: flash
%}
```

`severity` is `success`, `error`, `info` or `warning`. The user module's `modules/user/helpers/flash` helper builds this for you.


### Loading HTML endpoint and placing it in a container

A pre-defined method of loading HTML content into a container. When the page has a `[data-load-content]` element, `init` loads `js/pos-load.js` and wires it automatically (see below). To use it from your own script, load the module first:

```js
await import("{{ 'modules/common-styling/js/pos-load.js' | asset_url }}");
new pos.modules.load({
  trigger: [dom node],
  endpoint: [string],
  target: [string],
  where: [string],
  triggerType: [string],
  method: [string]
});
```
|  parameter  | type     | description                                                            |
|-------------|----------|------------------------------------------------------------------------|
| trigger     | dom node | The HTML element that triggers loading the endpoint |
| endpoint    | string   | URL of the endpoint that returns the HTML to be applied to a container |
| target      | string   | Selector for the target container that the HTML will be applied to     |
| where       | string   | `replace` (default) replaces the container's content, `last` appends after its last node |
| triggerType | string   | `click` (default) or `mouseenter` — the event that starts the loading |
| method      | string   | HTTP method of the request, `get` (default) or `post` |

When the content is in place, the trigger dispatches a `pos-frame-loaded` event.


You can use the `load` method directly or use the simpler method by adding some custom attributes to the trigger element that will initialize loading the endpoint when interacted with:

Clicking the following button will load the HTML from `/test/example_endpoint` to the container with ID `example_container`:

```html
<button type="button" data-load-content="/test/example_endpoint" data-load-target="#example_container">Load</button>

<div id="example_container">Loading…</div>
```

| attribute              | description                                                                 |
|------------------------|-----------------------------------------------------------------------------|
| data-load-content    | URL of the endpoint that returns the HTML to be applied to a container       |
| data-load-target     | Selector for the target container that the HTML will be applied to           |
| data-load-where      | `replace` (default) or `last` – the returned HTML replaces the container’s content or is appended after its last node |
| data-load-trigger-type | Defines whether the loading process is triggered by a `click` or `mouseenter` event |

### Disabled elements

Disabled elements keep their pointer events, so they show the `not-allowed` cursor over their whole area. Native `disabled` controls are inert anyway; for everything else `init` registers one capture-phase `click` / `auxclick` listener on `document` that cancels a click on (or inside) an element with `aria-disabled="true"`, and on a `.pos-link--disabled` link, before any other handler runs. Mark a custom disabled control with `aria-disabled="true"` and it is blocked too; don't rely on `pointer-events: none`. The guard lives in `init`: a page that loads only the CSS gets the not-allowed cursor but no click blocking, so there drop the `href` of a disabled link. Pair `.pos-link--disabled` with `aria-disabled="true"` so screen readers announce it.

## Components, themes and high contrast

The full component catalog (classes, partials, tokens), brand themes, `pos-scheme-*` color modes and the high contrast mode are documented on the `/style-guide` docs site and summarized in [AGENTS.md](AGENTS.md). What changed between versions: [CHANGELOG.md](CHANGELOG.md); how to update your code after a breaking change: [MIGRATION.md](MIGRATION.md).

## Credits

Icons: [Tabler Icons](https://tabler.io/icons) (MIT License, © Paweł Kuna), generated into `icon.liquid` by `npm run build:icons` from `tokens/icon-registry.json`. The Figma file uses the licensed Streamline set, which cannot be redistributed — this is the one intentional difference between Figma and code.
