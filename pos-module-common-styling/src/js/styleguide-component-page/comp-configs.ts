


  /* ── preview: intent (Default / Success / Error) ────────────────
     Swaps the intent modifier class on all preview buttons.
     Preserves the base variant class (primary / secondary-filled / secondary).
  ─────────────────────────────────────────────────────────────────── */
  export var BUTTON_INTENT_CLASSES = ['pos-button-error', 'pos-button-success', 'pos-button-inverted'];


  /* ── preview: tag intent ────────────────────────────────────────
     Swaps the intent modifier class on all .pos-tag elements in the
     tag preview stage. Does not affect the state (hover/focus/etc).
  ─────────────────────────────────────────────────────────────────── */
  export var TAG_INTENT_CLASSES  = ['pos-tag-neutral', 'pos-tag-confirmation', 'pos-tag-warning', 'pos-tag-important'];
  export var CHIP_INTENT_CLASSES = ['pos-chip-warning', 'pos-chip-success', 'pos-chip-error', 'pos-chip-neutral'];
  /* ── icon size map ── */
  export var ICON_SIZE_MAP: Record<string, { css: string; figma: string }> = {
    s: { css: '--pos-size-icon-xs', figma: 'Sizing/Icon XS (12)' },
    m: { css: '--pos-size-icon-s',  figma: 'Sizing/Icon S (16)'  },
    l: { css: '--pos-size-icon-m',  figma: 'Sizing/Icon M (20)'  },
  };

  /* ── per-component config ── */
  export var COMP_CONFIGS: Record<string, any> = {
    'control-icons': {
      name: 'Control icons',
      controls: ['control-icons-kind', 'state', 'icon-size'],
      states: ['normal', 'hover', 'focus', 'disabled'],
      usage: {
        useWhen: [
          '<strong>Chevron — expand / collapse:</strong> dropdowns, collapsible menus and navigation sections, accordions, tree views, expandable table rows, collapsible sidebars and panels, FAQ sections.',
          '<strong>Close:</strong> closeable modals and dialogs, closeable alerts, messages and notifications, toasts, banners, closeable tags and chips, drawers and side panels, popovers.',
        ],
        avoidWhen: [
          'Using as a decorative or purely informational icon — control icons always imply user interaction.',
          'Using the chevron as a directional or navigation arrow — use a dedicated arrow icon instead.',
          'Using the close icon as a "delete" or "remove record" action — use a trash / delete icon for destructive data operations.',
        ],
        do: [
          'Always use <code>&lt;button type="button"&gt;</code> as the element — never <code>&lt;div&gt;</code> or <code>&lt;span&gt;</code>.',
          'Always include <code>aria-label</code> on close buttons describing exactly what will be closed or removed (e.g. "Close dialog", "Remove Electronics tag").',
          'Use <code>aria-expanded</code> on chevron buttons to communicate state — rotation is driven by this attribute automatically.',
          'Always pair <code>aria-expanded</code> with <code>aria-controls</code> pointing to the controlled panel\'s <code>id</code>.',
          'Size control icons relative to their context — use the S token inside compact components (tags, dense lists), M as the default, L for prominent surfaces (dialogs, large cards).',
        ],
        dont: [
          'Nest a close button inside another <code>&lt;button&gt;</code> — interactive elements cannot be nested.',
          'Use the chevron to indicate navigation to a new page — use a link with an arrow icon instead.',
          'Rely on the icon alone to communicate state — always pair with <code>aria-expanded</code> or <code>aria-label</code>.',
          'Use control icons purely for decoration — their animated behavior signals actionability.',
        ],
        accessibility: [
          'Close: <code>aria-label</code> must describe what is closed or removed, not just say "Close".',
          'Chevron: set <code>aria-expanded="false"</code> by default; toggle to <code>"true"</code> when the panel is open.',
          'Chevron: <code>aria-controls</code> must point to the <code>id</code> of the controlled panel.',
          'Chevron: include a visually hidden <code>&lt;span class="pos-label"&gt;</code> as the accessible button label.',
        ],
      },
    },
    button: {
      name: 'Button',
      controls: ['button-base', 'state', 'size', 'intent'],
      states: ['normal', 'hover', 'focus', 'active', 'disabled', 'loading'],
      usage: {
        useWhen:   'Triggering an action — submitting a form, opening a dialog, confirming a choice, or initiating any process that does not navigate away from the page. Use <code>pos-button</code> whenever the outcome is an action, not a navigation.',
        avoidWhen: 'Navigation to another page or URL — use a link (<code>&lt;a&gt;</code>) instead. Do not use a button purely to make text look interactive.',
        doText:    'Use <code>type="submit"</code> on form submission buttons and <code>type="button"</code> on all others. Choose the intent variant (<code>primary</code>, <code>secondary</code>, <code>ghost</code>) that matches the action\'s visual weight and importance on the page.',
        dontText:  'Do not place more than one primary button per screen — it creates competing calls to action. Do not rely on the button label alone to communicate a destructive action; pair it with a confirmation step.',
      },
    },
    'tile-btn': {
      name: 'Choice button',
      controls: ['state', 'orientation'],
      states: ['normal', 'hover', 'focus', 'selected', 'disabled', 'selected-disabled'],
      usage: {
        useWhen: [
          'Letting the user select from a small set of prominent, mutually exclusive options — mode pickers, filter palettes, settings panels — where each option has an icon and benefits from a larger touch target.',
          'In a variant panel or options bar where a segmented control would be too compact.',
        ],
        avoidWhen: [
          'More than 4–5 options — the row becomes too wide; use a <code>&lt;select&gt;</code> or segmented control instead.',
          'Options have no meaningful icon — use <code>pos-segmented-control</code> instead.',
          'The choice is not mutually exclusive — use checkboxes instead.',
        ],
        do: [
          'Use <code>&lt;button type="button"&gt;</code> as the element — never a <code>&lt;div&gt;</code> or <code>&lt;a&gt;</code>.',
          'Set <code>aria-pressed="true"</code> on the active tile and <code>aria-pressed="false"</code> on all others.',
          'Keep labels short — 1–3 words maximum.',
          'Wrap a group of related tile buttons in a <code>role="group"</code> container with an <code>aria-label</code>.',
        ],
        dont: [
          'Use tile buttons for navigation — use links instead.',
          'Leave all tiles un-selected unless the setting is genuinely optional with no default.',
        ],
      },
    },
    segmented: {
      name: 'Segmented button',
      controls: ['segmented-variant', 'state', 'size'],
      states: ['normal', 'disabled'],
      usage: {
        surfaces: [
          { surface: 'Content background',     hex: '#ffffff', variants: ['default', 'highlighted'] },
          { surface: 'Page background',         hex: '#f3f5f8', variants: ['highlighted', 'subtle'] },
          { surface: 'Highlighted background',  hex: '#e7ecf3', variants: ['default', 'subtle'] },
        ],
        useWhen: [
          'Switching between 2—4 mutually exclusive views, modes, or filters (e.g. Day / Week / Month, List / Grid).',
          'All options are visible at once and the user switches frequently.',
        ],
        avoidWhen: [
          'More than 4 options — use a tab bar or select instead.',
          'Options with long labels that would wrap or truncate.',
          'Navigation between pages — use the navigation component instead.',
          'Binary on/off — use a checkbox or toggle switch instead.',
        ],
        do: [
          'Always have exactly one active option at any given time.',
          'Provide a meaningful <code>aria-label</code> on the wrapper to describe what the group controls.',
          'Set <code>aria-pressed="true"</code> on the active button and <code>aria-pressed="false"</code> on others.',
          'Choose the variant based on the background surface — no variant should sit on a matching background color.',
          'Use the small variant on desktop only.',
        ],
        dont: [
          'Use for binary on/off toggles — use a checkbox or toggle switch instead.',
          'Mix color variants within the same group.',
          'Place more than 4 options in a single segmented control.',
          'Use the small variant as the default on touch/mobile — minimum touch target is 44px.',
        ],
        accessibility: [
          'Wrapper uses <code>role="group"</code> with a descriptive <code>aria-label</code>.',
          'Each button uses <code>aria-pressed</code> to communicate active state to screen readers.',
          'Fully keyboard navigable via <kbd>Tab</kbd> — active button receives visible focus via <code>:focus-visible</code>.',
          'Active button has <code>cursor: default</code> — it is not re-clickable.',
          'Small variant is desktop-only — never use as the default on touch devices (minimum touch target is 44px).',
        ],
      },
    },
    link: {
      name: 'Link',
      controls: ['state', 'size'],
      states: ['normal', 'hover', 'focus', 'active', 'visited', 'disabled'],
      usage: {
        useWhen:   'Navigating to another page, section, or URL — inline within body text, or as a standalone navigation target. Use <code>&lt;a href="..."&gt;</code> whenever the outcome is navigation, not an action.',
        avoidWhen: 'Triggering a JavaScript action (submit, delete, toggle, open dialog) — use a <code>&lt;button&gt;</code> instead. Never use a link where pressing Enter would be unexpected.',
        doText:    'Use descriptive link text that makes sense out of context — "View order details" not "Click here". Always underline inline text links so they are visually distinguishable without relying on color alone.',
        dontText:  'Do not use a bare <code>javascript:void(0)</code> or empty <code>href="#"</code> for action links — use a <code>&lt;button&gt;</code>. Never remove the underline from inline text links; it is required for WCAG compliance.',
      },
    },
    chip: {
      name: 'Chip',
      controls: ['chip-variant', 'chip-size', 'chip-intent'],
      states: [],
      tokens: [],
      usage: {
        useWhen: [
          'Displaying the status of an item — e.g. "Published", "Draft", "In review".',
          'Showing a category, type, or label in a compact badge format on a content item.',
          'Communicating urgency or outcome with semantic color: <code>pos-chip-error</code> for failures, <code>pos-chip-success</code> for completions, <code>pos-chip-warning</code> for caution states.',
          'Add <code>pos-chip--prominent</code> for higher-contrast solid-background emphasis when the chip needs to stand out more.',
        ],
        avoidWhen: [
          'The label needs to be interactive (clickable, selectable, or removable) — use a <strong>Tag</strong> component instead.',
          'The label text is long or needs to wrap — chips are single-line only.',
          'Displaying numeric counts or quantities — use a badge or counter instead.',
        ],
        do: [
          'Use <code>&lt;span&gt;</code> as the element — chips are purely presentational and non-interactive.',
          'Always apply an intent class (<code>pos-chip-warning</code>, <code>pos-chip-success</code>, <code>pos-chip-error</code>, <code>pos-chip-neutral</code>) — the base <code>pos-chip</code> alone has no background color.',
          'Keep labels to 1–3 words — chips must be scannable at a glance.',
        ],
        dont: [
          'Use a chip for primary actions or CTAs — use a button instead.',
          'Apply semantic colors arbitrarily — color signals meaning: warning = caution, error = failure/urgent, success = positive/complete.',
          'Use <code>&lt;button&gt;</code> or <code>&lt;a&gt;</code> as the element — chips are non-interactive.',
        ],
        accessibility: [
          'Because chips are non-interactive, no keyboard focus or ARIA roles are needed on the chip element itself.',
          'If a chip communicates status inside a dynamic list, wrap the container in <code>aria-live="polite"</code>.',
        ],
      },
    },
    tag: {
      name: 'Tag',
      controls: ['tag-kind', 'state', 'tag-size', 'tag-intent'],
      states: ['normal', 'hover', 'focus', 'disabled', 'selected'],
      usage: {
        useWhen: [
          '<strong>Static tag:</strong> displaying short, non-interactive metadata labels on content items — category, status, type. Use a <code>&lt;span&gt;</code> element.',
          '<strong>Interactive tag — navigating:</strong> tags that link to another page on click, e.g. a category tag on a blog post that navigates to a filtered listing. Use an <code>&lt;a&gt;</code> element.',
          '<strong>Interactive tag — selectable:</strong> tags the user can toggle to express preference or apply a filter, e.g. "Choose topics you\'re interested in." Clicking switches the tag to the selected (highlighted) state. Use a <code>&lt;button&gt;</code> element and toggle <code>pos-tag-selected</code> on click.',
          'Communicating status with semantic intent — use confirmation, warning, or important variants with their correct meaning.',
        ],
        avoidWhen: [
          'The label text is long or needs to wrap — tags are single-line only.',
          'The tag is the primary action on the page — use a button instead.',
          'Displaying numeric values like counts — use a badge instead.',
        ],
        do: [
          'Keep labels short — 1—3 words maximum.',
          'Use <code>button</code> or <code>a</code> as the element for interactive tags so they are keyboard-focusable.',
          'Use <code>pos-tag-selected</code> to show the selected / active state.',
          'Use <code>pos-tag-neutral</code> for non-interactive informational tags on highlighted surfaces.',
          'Apply semantic variants with their correct intent: confirmation = positive, warning = caution, important = error/urgent.',
          'Wrap a group of tags in <code>.pos-tags-list</code> for correct spacing.',
        ],
        dont: [
          'Use tags as navigation — use links or buttons instead.',
          'Apply semantic color variants arbitrarily — color signals meaning.',
          'Use <code>div</code> or <code>span</code> for interactive tags.',
        ],
        accessibility: [
          'Interactive tags must use <code>&lt;button&gt;</code> or <code>&lt;a&gt;</code> — never a <code>&lt;div&gt;</code> or <code>&lt;span&gt;</code>.',
          'Interactive tags get a visible focus ring via <code>:focus-visible</code>.',
          'If a tag is removable, the remove trigger must have an <code>aria-label</code> describing what is being removed.',
        ],
      },
    },
    code: {
      name: 'Code',
      controls: ['code-kind', 'code-variant', 'code-inline-size', 'code-options'],
      states: [],
      tokens: [],
      usage: {
        useWhen: [
          'Displaying a short code reference inline in prose — a function name, variable, attribute, or command. Use <code>&lt;code class="pos-code"&gt;</code>.',
          'Showing a multi-line code sample, terminal output, or configuration snippet. Use <code>&lt;pre class="pos-code pos-code--block"&gt;&lt;code&gt;...&lt;/code&gt;&lt;/pre&gt;</code>.',
        ],
        avoidWhen: [
          'Styling non-code text as code — <code>pos-code</code> is reserved for actual code references.',
          'Nesting block code inside inline text or other inline elements.',
        ],
        do: [
          'Use the semantic <code>&lt;code&gt;</code> element — never a <code>&lt;span&gt;</code> or <code>&lt;div&gt;</code>.',
          'For multi-line blocks, always place the <code>&lt;code&gt;</code> directly inside <code>&lt;pre&gt;</code>.',
        ],
        dont: [
          'Apply <code>pos-code--block</code> to an inline <code>&lt;code&gt;</code> element — the block variant requires a <code>&lt;pre&gt;</code> wrapper.',
          'Use code styling for decorative or purely visual purposes — it carries semantic meaning for screen readers.',
        ],
        accessibility: [
          'Screen readers recognize <code>&lt;code&gt;</code> semantically — use the correct element so assistive technology can announce it appropriately.',
          'Block code with horizontal overflow should be keyboard-scrollable; ensure the <code>&lt;pre&gt;</code> element receives focus or is inside a focusable scrollable region.',
        ],
      },
    },
    'feature-card': {
      name: 'Feature card',
      controls: ['card-variant', 'state', 'card-size', 'card-options'],
      states: ['normal', 'hover'],
      tokens: [],
      usage: {
        useWhen: [
          'Presenting a self-contained piece of content — a feature, section, or offer — with an icon, title, description, and optional action buttons.',
          'Grouping related information in a visually distinct, elevated surface.',
        ],
        avoidWhen: [
          'Navigating to another page — use a link or a button instead.',
          'Showing tabular or list data — use a table or list component.',
        ],
        do: [
          'Include an icon in <code>.pos-feature-card-icon</code> to give the card visual identity.',
          'Add <code>.pos-feature-card--centered</code> to center all content when the card stands alone or is in a symmetrical grid.',
          '<strong>Default first:</strong> always start with the built-in size variants (Small / Default / Large). Only deviate when the surrounding heading hierarchy would otherwise be broken.',
          '<strong>Page hierarchy override (cards &amp; text sections):</strong> when building a full page or UI, you may override the card\'s text and icon sizes to serve the document\'s visual and heading hierarchy — e.g. a card that acts as the main feature on a page may use a larger title size than the default. Adjust <code>.pos-feature-card-title</code>, <code>.pos-feature-card-subtitle</code>, or icon size as needed to keep headings in correct H1→H2→H3 order relative to surrounding content.',
        ],
        dont: [
          'Nest interactive elements inside a card that is itself clickable — it creates ambiguous interaction targets.',
          'Use the card as a navigation element — it is a content container, not a link.',
          'Override the size of buttons, chips, or tags inside a card for hierarchy purposes — these components always use their own standard size variants (default or small). Typography flexibility applies to card text elements and icons only.',
        ],
        accessibility: [
          'Buttons inside <code>.pos-feature-card-actions</code> must have descriptive labels — avoid generic "Click here".',
        ],
      },
    },
    'toast': {
      name: 'Toast',
      controls: ['toast-variant', 'state', 'toast-options'],
      states: ['normal', 'hover'],
      tokens: [],
      usage: {
        useWhen: [
          'Confirming the result of a user action (save, delete, submit) without interrupting their flow.',
          'Showing a brief success/error/info message that does not need to stay on screen or block interaction.',
        ],
        avoidWhen: [
          'Showing a message that must stay visible in context next to specific content — use Alert card instead.',
          'Requiring the user to make a decision or acknowledge before continuing — use a Dialog instead.',
        ],
        do: [
          'Trigger via <code>new window.pos.modules.toast(type, message)</code> — never build the notification markup by hand.',
          'Use <code>success</code> for confirmations, <code>error</code> for failures, <code>info</code> for neutral updates.',
          'Keep the message short — one line, no more than a sentence.',
        ],
        dont: [
          'Stack more than a few toasts at once — they queue visually but too many becomes unreadable.',
          'Rely on a toast alone for critical/blocking errors the user must not miss — pair with inline validation or an Alert card too.',
        ],
        accessibility: [
          'Each toast has <code>role="alert"</code> and <code>aria-live="assertive"</code> so screen readers announce it immediately.',
          'The close button has a visually-hidden <code>.label</code> span with real text, not just the <code>×</code> glyph, for screen reader users.',
        ],
      },
    },
    'markdown': {
      name: 'Markdown editor',
      controls: [],
      states: ['normal'],
      tokens: [],
      usage: {
        useWhen: [
          'Letting a user write long-form, formatted content (descriptions, articles, comments) using Markdown syntax with a visual toolbar.',
          'Needing a live preview of the rendered Markdown, or drag-and-drop/paste image upload inline with the content.',
        ],
        avoidWhen: [
          'A short, single-line text input — use Input instead.',
          'Plain, unformatted multi-line text with no Markdown/preview/upload needs — use Textarea instead.',
        ],
        do: [
          'Trigger via <code>new window.pos.modules.markdown({ container })</code> — never build or style EasyMDE\'s toolbar/preview markup by hand, it is entirely generated at runtime.',
          'Provide a real <code>presigned_upload</code> object in production if image upload is needed.',
        ],
        dont: [
          'Restyle EasyMDE\'s toolbar/editor beyond the color/radius tokens already applied in <code>pos-markdown.css</code> — its internal layout is controlled by the library.',
        ],
        accessibility: [
          'EasyMDE\'s toolbar buttons are keyboard-operable and carry their own accessible labels/titles.',
        ],
      },
    },
    'file-upload': {
      name: 'File upload',
      controls: [],
      states: ['normal'],
      tokens: [],
      usage: {
        useWhen: [
          'Letting a user attach one or more files (images, documents) to a form, with drag-and-drop and a file browser fallback.',
          'Needing upload progress, thumbnails, or basic image cropping/editing before the file is submitted.',
        ],
        avoidWhen: [
          'A single, simple file input with no preview or progress needed — a plain <code>&lt;input type="file"&gt;</code> is enough.',
        ],
        do: [
          'Trigger via <code>new window.pos.modules.upload({ container })</code> — never build or style Uppy\'s internal Dashboard markup by hand, it is entirely generated at runtime.',
          'Provide a real <code>presigned_upload</code> object (from a <code>property_upload_presigned_url</code> query) in production — the upload endpoint is required for files to actually save.',
          'Pass <code>files</code> to pre-populate already-uploaded files when editing an existing record.',
        ],
        dont: [
          'Restyle Uppy\'s Dashboard beyond the color/radius tokens already applied in <code>pos-upload.css</code> — its internal layout is controlled by the library, not this design system.',
        ],
        accessibility: [
          'Uppy\'s Dashboard provides its own keyboard-operable file browser button and accessible progress announcements.',
        ],
      },
    },
    'tab': {
      name: 'Tab',
      controls: ['tab-variant', 'state'],
      states: ['normal', 'hover', 'focus', 'selected', 'disabled', 'selected-disabled'],
      tokens: [],
      usage: {
        useWhen: [
          'Switching between a small, fixed set of related views or filtered sections of the same page, without navigating away.',
          'The Detailed variant specifically: when each tab itself carries meaningful summary data worth showing before the user switches to it.',
        ],
        avoidWhen: [
          'Navigating to a genuinely different page or URL outside the current context — use real navigation/links instead.',
          'More than a handful of mutually-exclusive short options with no summary data of their own — consider Segmented button instead.',
        ],
        do: [
          'Mark the active tab with <code>pos-tab--active</code> (Simple/Overflow) or <code>pos-tab-detailed--active</code> (Detailed), and set <code>aria-current="page"</code> on it.',
          'Use a real <code>&lt;nav&gt;</code> wrapper (<code>.pos-tabs</code>) for the Simple/Overflow variants.',
        ],
        dont: [
          'Mix the Simple/Overflow tab classes with the Detailed card classes in the same tab row.',
          'Use more than one active tab at a time.',
        ],
        accessibility: [
          'Set <code>aria-current="page"</code> on the active tab so assistive technology announces which one is selected.',
          'The Overflow kebab trigger needs <code>aria-haspopup="menu"</code> and a real accessible label since it carries no visible text.',
        ],
      },
    },
    'toggle-btn': {
      name: 'Toggle button',
      controls: ['toggle-btn-state'],
      states: ['off', 'on', 'off-disabled', 'on-disabled', 'focus'],
      tokens: [],
      usage: {
        useWhen: [
          'A single, standalone on/off setting inline with other content.',
          'Building a custom control layout where Switch button\'s fixed label/icon/card structure doesn\'t fit.',
        ],
        avoidWhen: [
          'A full-width labeled setting row — use Switch button instead.',
          'Choosing one of 3+ mutually exclusive options — use Segmented button instead.',
        ],
        do: [
          'Always pair with a visible or programmatically-associated label — the track alone has no accessible name.',
          'Use role="switch" on the checkbox input, not just type="checkbox" alone.',
        ],
        dont: [
          'Use as a substitute for Switch button when a label and description are needed.',
          'Render more than one visual state at once.',
        ],
        accessibility: [
          'role="switch" announces it as a two-state switch, not a plain checkbox, to assistive technology.',
          'The visible focus ring only appears via :focus-visible, so it does not show on a plain mouse click.',
        ],
      },
    },
    'table': {
      name: 'Table',
      controls: ['table-variant'],
      states: ['normal'],
      tokens: [],
      usage: {
        useWhen: [
          'Displaying structured, multi-column data (e.g. a list of records) that needs to stay legible on mobile without horizontal scrolling.',
          'Showing numeric/tabular data with column headers.',
        ],
        avoidWhen: [
          'A simple, single-column list — a plain <code>&lt;ul&gt;</code> needs none of this component\'s column/responsive machinery.',
          'Data that genuinely requires a real HTML table for semantics (e.g. complex spanning cells).',
        ],
        do: [
          'Wrap each row in its own <code>&lt;ul&gt;</code> inside <code>.pos-table-content</code>, with one <code>&lt;li&gt;</code> per column.',
          'Add <code>&lt;span class="pos-table-content-heading"&gt;</code> inside each cell — hidden on desktop, shown as a label prefix on mobile.',
          'Use <code>.pos-table-number</code> on numeric columns to right-align them.',
        ],
        dont: [
          'Use a real <code>&lt;table&gt;</code>/<code>&lt;tr&gt;</code>/<code>&lt;td&gt;</code> element with these classes — the CSS targets <code>&lt;ul&gt;</code>/<code>&lt;li&gt;</code> specifically.',
          'Forget the per-cell heading span — without it, mobile users see unlabeled stacked values.',
        ],
        accessibility: [
          'Since this is a styled list, not a real table, it carries no native table semantics — consider ARIA table roles if the data needs them.',
        ],
      },
    },
    'dialog': {
      name: 'Dialog',
      controls: ['dialog-variant', 'state'],
      states: ['normal', 'hover', 'focus'],
      tokens: [],
      usage: {
        useWhen: [
          'Requiring the user to make a decision or confirm/cancel an action before continuing.',
          'Showing focused content that needs the rest of the page dimmed and inert while it is open.',
        ],
        avoidWhen: [
          'Showing a brief, non-blocking confirmation — use a Toast instead.',
          'Showing a message that must stay visible in context next to specific content — use an Alert card instead.',
        ],
        do: [
          'Trigger via <code>new window.pos.modules.dialog({ container, trigger })</code> — never call <code>.showModal()</code> directly on the element.',
          'Give the trigger a <code>data-dialogtarget</code> matching the dialog\'s <code>id</code> when no explicit trigger/container is passed.',
          'Use the Simple variant (no title, just a close button) only for minimal confirmation content.',
        ],
        dont: [
          'Omit a way to close the dialog — always include a <code>.pos-dialog-close</code> button, even alongside action buttons.',
          'Nest a dialog inside another dialog.',
        ],
        accessibility: [
          'The native <code>&lt;dialog&gt;</code> element with <code>showModal()</code> provides a built-in focus trap and Escape-to-close for free.',
          'The close button has a visually-hidden <code>.pos-label</code> span with real text, not just the <code>×</code> glyph, for screen reader users.',
        ],
      },
    },
    'alert-card': {
      name: 'Alert card (legacy)',
      controls: ['alert-card-variant', 'alert-card-options'],
      states: ['normal'],
      tokens: [],
      usage: {
        useWhen: [
          'Showing an inline informational, warning, error, or success message within page content — adjacent to a card or content block.',
          'Communicating the result of a user action (e.g. form submit, deletion) in context, without interrupting the user with a floating notification.',
        ],
        avoidWhen: [
          'Showing a transient notification that disappears after a few seconds — use <code>pos-toast</code> instead.',
          'Building new features — consider a proper DS alert or notification component.',
        ],
        do: [
          'Apply <code>pos-card</code> alongside <code>pos-card-alert</code> to get the correct padding and border-radius.',
          'Include an icon as the first child — the CSS sizes it to <code>1.5rem</code> automatically.',
          'Use the correct semantic modifier: <code>pos-card-alert-warning</code>, <code>pos-card-alert-error</code>, or <code>pos-card-alert-success</code>.',
        ],
        dont: [
          'Use <code>pos-card-alert</code> as a floating or fixed-position notification — it is an inline element.',
          'Omit the icon — the layout expects it and the text alignment depends on it.',
        ],
        accessibility: [
          'Add <code>role="alert"</code> when the alert appears dynamically so screen readers announce it immediately.',
          'For non-urgent messages that do not require immediate attention, use <code>role="status"</code> or <code>aria-live="polite"</code> instead.',
        ],
      },
    },
    card: {
      name: 'Card (legacy)',
      controls: ['card-legacy-variant', 'state', 'card-legacy-options'],
      states: ['normal', 'hover', 'focus'],
      tokens: [],
      usage: {
        useWhen: [
          'Grouping related content in a visually distinct, elevated surface.',
          'Displaying a content item with an optional image, title, and footer (content card).',
          'Showing informational, warning, error, or success messages inline with content (alert card).',
        ],
        avoidWhen: [
          'Building new features — prefer <code>pos-feature-card</code> for feature showcases.',
          'Interactive card-based navigation — use a link or button instead.',
        ],
        do: [
          'Apply both <code>pos-card</code> and <code>pos-card-content</code> on the same element for content cards with images.',
          'Use <code>pos-card-content-permalink</code> on the <code>&lt;a&gt;</code> element to enable the hover image zoom and card-level focus ring.',
          'Place alert cards adjacent to the content they describe — use <code>pos-card-alert</code> as a sibling of <code>pos-card</code>.',
        ],
        dont: [
          'Mix card variants — do not apply <code>pos-card-highlighted</code> and <code>pos-card-content</code> on the same element.',
          'Nest interactive elements inside a content card that has a permalink — it creates ambiguous interaction targets.',
        ],
        accessibility: [
          'Content cards with a permalink must have meaningful link text or an <code>aria-label</code> on the anchor.',
          'Alert cards that update dynamically should use <code>role="alert"</code> or <code>aria-live="polite"</code> so screen readers announce them.',
        ],
      },
    },
    'switch-card': {
      name: 'Switch button',
      controls: ['state', 'switch-size', 'switch-icon'],
      states: ['normal', 'hover', 'focus', 'disabled', 'selected', 'selected-disabled'],
      tokens: [],
      usage: {
        useWhen: [
          'Letting users toggle a feature or setting on or off — especially when the option has a name and an icon that benefits from a larger, more prominent touch target.',
          'Presenting a small set of independent boolean options that each deserve visual weight (e.g. accessibility preferences, feature flags).',
        ],
        avoidWhen: [
          'The toggle is a simple inline switch with no icon or label prominence — use a standard form checkbox or toggle switch instead.',
          'Multiple tightly-grouped options — switch cards take up significant vertical space.',
        ],
        do: [
          'Always use <code>&lt;label&gt;</code> as the root element wrapping <code>&lt;input type="checkbox" role="switch"&gt;</code> — this gives the entire card a correct accessible click target.',
          'Use a meaningful <code>aria-label</code> or visible label text that describes exactly what the switch controls.',
          'Use an icon that visually represents the feature being toggled.',
        ],
        dont: [
          'Use the switch card as a navigation element — it is a toggle, not a link.',
          'Omit the <code>role="switch"</code> attribute — without it, screen readers announce it as a checkbox, not a toggle switch.',
        ],
        accessibility: [
          'The hidden <code>&lt;input type="checkbox" role="switch"&gt;</code> carries all semantics. Screen readers announce the label and checked state automatically.',
          'The card receives focus (not the hidden input) — the <code>:focus-visible</code> ring appears on the <code>&lt;label&gt;</code> via the <code>:has(:focus-visible)</code> selector.',
        ],
      },
    },
    avatar: {
      name: 'Avatar',
      controls: ['state', 'avatar-size', 'avatar-options'],
      states: ['normal', 'hover'],
      tokens: [],
      usage: {
        useWhen: [
          'Representing a user, contact, or entity with a profile image or initials.',
          'Appearing in lists, headers, comments, or chat interfaces alongside user-generated content.',
        ],
        avoidWhen: [
          'Displaying a logo or brand mark — use an <code>&lt;img&gt;</code> directly instead.',
          'The context does not relate to a specific person or entity.',
        ],
        do: [
          'Always provide a meaningful <code>alt</code> attribute on the inner <code>&lt;img&gt;</code> — use the person\'s name.',
          'Show initials as a fallback when no image is available.',
          'Use the <code>pos-avatar-lg</code> (48px) default for most contexts; choose smaller sizes only when space is limited.',
        ],
        dont: [
          'Use the avatar as a button or interactive element without adding appropriate ARIA roles and keyboard handling.',
          'Omit the <code>alt</code> attribute or leave it empty when the image conveys the user\'s identity.',
        ],
        accessibility: [
          'Initials text inside a no-image avatar should be aria-hidden if the user\'s name is already present nearby.',
          'When the avatar is interactive (e.g. a link to a profile), wrap it in an <code>&lt;a&gt;</code> with a descriptive <code>aria-label</code>.',
        ],
      },
    },
    pagination: {
      name: 'Pagination',
      controls: ['pagination-page'],
      states: ['normal', 'hover', 'focus'],
      tokens: [],
      usage: {
        useWhen: [
          'Splitting long lists, search results, or data tables into discrete numbered pages.',
          'The total number of pages is known and users benefit from seeing their position.',
        ],
        avoidWhen: [
          'Fewer than 2 pages of results — do not show pagination at all.',
          'Infinite scroll or "load more" patterns are more appropriate for the content type.',
        ],
        do: [
          'Set <code>aria-current="true"</code> on the current page link.',
          'Include a visually-hidden <code>pos-label</code> on the prev/next arrow links so screen readers announce the action.',
          'Wrap the whole component in <code>&lt;nav role="navigation" aria-label="Pagination Navigation"&gt;</code>.',
        ],
        dont: [
          'Hide the prev/next arrows — they are important for keyboard and screen reader navigation.',
          'Show pagination when there is only one page of results.',
        ],
        accessibility: [
          'Every page link must have an <code>aria-label</code>: "Go to page N" for non-current pages, "Current Page, Page N" for the active one.',
          'Prev/next links must have a descriptive accessible name even when they display only an icon.',
          'Surround with <code>&lt;nav&gt;</code> so assistive technology exposes it as a navigation landmark.',
        ],
      },
    },
    'collapsible-list': {
      name: 'Collapsible list',
      controls: [],
      states: ['normal', 'hover', 'focus'],
      tokens: [],
      usage: {
        useWhen: [
          'Hierarchical sidebar navigation with two or more levels.',
          'Documentation outlines where sections need to expand and collapse.',
          'Multi-level navigation trees where not all items should be visible at once.',
        ],
        avoidWhen: [
          'Flat navigation with a single level — use a plain list instead.',
          'Fewer than 3 expandable sections where all items fit on screen — prefer a flat list.',
        ],
        do: [
          'Add <code>inert</code> to <code>.pos-collapsible-children</code> to collapse a section by default.',
          'Set <code>aria-expanded</code> on each toggle button and pair it with <code>aria-controls</code> pointing to the children div\'s <code>id</code>.',
          'Add <code>pos-collapsible-active</code> to the <code>&lt;li&gt;</code> of the currently active page.',
          'Initialize with <code>new window.pos.modules.collapsible({ container })</code> to wire up keyboard navigation.',
        ],
        dont: [
          'Nest more than 3 levels — the visual hierarchy becomes too deep to navigate.',
          'Use without initializing the collapsible JS module — toggle buttons will be inert.',
        ],
        accessibility: [
          'Each toggle button requires <code>aria-expanded</code> (false = collapsed, true = expanded) and <code>aria-controls</code> pointing to the children container\'s <code>id</code>.',
          'Collapsed children receive the <code>inert</code> attribute — removing them from tab order and screen reader announcement automatically.',
          '<kbd>Arrow left / right</kbd> keyboard navigation is handled by the <code>pos.modules.collapsible</code> JS module.',
        ],
      },
    },
    radio: {
      name: 'Radio',
      controls: ['state'],
      states: ['normal', 'hover', 'focus', 'selected', 'disabled', 'selected-disabled'],
      usage: {
        useWhen: [
          'Selecting exactly one option from a set of mutually exclusive choices.',
          'The user must make a choice — all options should be visible upfront.',
        ],
        avoidWhen: [
          'Multiple selections are valid — use checkboxes instead.',
          'There are more than ~6 options — consider a <code>&lt;select&gt;</code> dropdown instead.',
          'There is only one option — use a checkbox or switch instead.',
        ],
        do: [
          'Group all related radio inputs under the same <code>name</code> attribute so only one can be selected at a time.',
          'Wrap each input+label pair in a <code>&lt;fieldset&gt;</code> with a <code>&lt;legend&gt;</code> describing the group.',
          'Pre-select the most common or safe default option with the <code>checked</code> attribute.',
        ],
        dont: [
          'Use a radio group for binary yes/no — a checkbox or toggle is clearer.',
          'Leave the group with no default selection unless the user must actively choose.',
        ],
        accessibility: [
          'All radio inputs in a group must share the same <code>name</code> — this is how the browser enforces mutual exclusion and announces the group to screen readers.',
          'Each input must have a <code>&lt;label&gt;</code> associated via matching <code>for</code> and <code>id</code>.',
          'Wrap the group in a <code>&lt;fieldset&gt;</code> with a <code>&lt;legend&gt;</code> so assistive technology announces the group label before each option.',
        ],
      },
    },
    checkbox: {
      name: 'Checkbox',
      controls: ['state'],
      states: ['normal', 'hover', 'focus', 'selected', 'disabled', 'selected-disabled'],
      usage: {
        useWhen: [
          'Selecting zero or more independent options from a list.',
          'Toggling a single boolean setting (e.g. "Remember me", "Agree to terms").',
        ],
        avoidWhen: [
          'Exactly one option must be selected — use radio buttons instead.',
          'The toggle is part of a larger interactive card — use <code>pos-switch-card</code> instead.',
        ],
        do: [
          'Always associate a visible <code>&lt;label&gt;</code> with each checkbox via <code>for</code>/<code>id</code>.',
          'Mark required checkboxes with the <code>required</code> attribute.',
          'Use a <code>&lt;fieldset&gt;</code> with a <code>&lt;legend&gt;</code> when grouping related checkboxes.',
        ],
        dont: [
          'Use for mutually exclusive choices — that is what radio buttons are for.',
          'Rely on visual proximity alone to associate the label — always use <code>for</code>/<code>id</code>.',
        ],
        accessibility: [
          'Each checkbox must have an associated <code>&lt;label&gt;</code> so screen readers announce its purpose.',
          'Use <code>aria-required="true"</code> or the <code>required</code> attribute on required checkboxes.',
          'Group related checkboxes in a <code>&lt;fieldset&gt;</code> with a <code>&lt;legend&gt;</code>.',
        ],
      },
    },
    popover: {
      name: 'Popover menu',
      controls: ['popover-state'],
      states: [],
      usage: {
        useWhen: [
          'Offering a small set of contextual actions for a specific item (e.g. Edit, Duplicate, Delete).',
          'Triggering a dropdown menu from a button without navigating away from the page.',
        ],
        avoidWhen: [
          'More than 5–6 items — prefer a dedicated page or modal.',
          'The actions are primary and should always be visible — use buttons directly instead.',
        ],
        do: [
          'Use <code>pos-popover-menu-item-important</code> only for destructive or irreversible actions (e.g. Delete).',
          'Wrap each action in <code>&lt;li&gt;</code> inside a <code>&lt;menu&gt;</code> element — this gives the list correct semantics.',
          'Use <code>&lt;a&gt;</code> for navigational items and <code>&lt;button&gt;</code> for actions.',
        ],
        dont: [
          'Mix navigation and destructive actions in the same popover without visual separation.',
          'Use the popover for long forms or complex content — it is a menu, not a dialog.',
        ],
        accessibility: [
          'The trigger button automatically receives <code>aria-expanded</code> state when the popover opens.',
          'Items inside <code>&lt;menu&gt;</code> are announced as a list by screen readers.',
          'Destructive items should have a clear label — never rely on color alone to communicate danger.',
        ],
      },
    },
    'popover-content': {
      name: 'Popover',
      controls: ['popover-content-state'],
      states: [],
      usage: {
        useWhen: [
          'Showing a small floating panel of content anchored to a trigger element.',
          'Displaying tooltip-style information, context menus, or contextual UI that appears on demand without navigating away.',
        ],
        avoidWhen: [
          'The content is a structured list of actions — use Popover menu instead.',
          'The content requires user input or is too complex to fit in a small floating panel — use a dialog instead.',
        ],
        do: [
          'Always wrap the trigger and <code>[popover]</code> element in a <code>.pos-popover</code> container — this provides anchor positioning and the caret indicator.',
          'Use <code>&lt;button type="button" popovertarget="id"&gt;</code> as the trigger for correct accessibility.',
        ],
        dont: [
          'Use the native <code>[popover]</code> attribute without the <code>.pos-popover</code> wrapper — it will appear unstyled at the top of the viewport.',
          'Place long-form content or forms inside a popover — use a dialog instead.',
        ],
        accessibility: [
          'The browser automatically manages focus when the popover opens and closes.',
          'The popover closes on Escape key and on click outside (light dismiss) — no custom JS needed.',
        ],
      },
    },
    'text-input': {
      name: 'Input',
      controls: ['state', 'form-intent', 'text-input-options'],
      states: ['normal', 'hover', 'focus', 'filled', 'disabled', 'display-only'],
      usage: {
        useWhen: [
          'Collecting a single line of free-form text — names, emails, search queries, URLs, dates.',
          'Any form field where the expected input is short enough to fit on one line.',
          'Use with a trailing icon (<code>.pos-form-input-wrapper</code>) for fields with a picker — date, time, or similar.',
          'Add <code>readonly</code> to create a <strong>display-only</strong> field that loads or presents data without being editable. Background is transparent to distinguish it from editable fields.',
        ],
        avoidWhen: [
          'Multi-line text is expected — use <code>textarea</code> instead.',
          'The user must choose from a fixed set of options — use <code>select</code>, radio buttons, or checkboxes instead.',
        ],
        do: [
          'Always associate a visible <code>&lt;label&gt;</code> with the input via matching <code>for</code> and <code>id</code>.',
          'Use <code>type="email"</code>, <code>type="url"</code>, <code>type="datetime-local"</code> etc. for semantic correctness.',
          'Show helper text or a character counter inside the <code>&lt;label&gt;</code> as a <code>&lt;small&gt;</code> element — it right-aligns automatically.',
          'Use <code>aria-invalid="true"</code> + <code>.pos-form-error</code> for errors; <code>aria-invalid="false"</code> + <code>.pos-form-success</code> for success.',
        ],
        dont: [
          'Use <code>placeholder</code> as a substitute for a label.',
          'Style the input outside the <code>.pos-form</code> wrapper.',
        ],
        accessibility: [
          'Every input must have a programmatically associated <code>&lt;label&gt;</code>.',
          'Error and success messages should be linked via <code>aria-describedby</code>.',
          'Required fields must use the <code>required</code> attribute.',
        ],
      },
    },
    textarea: {
      name: 'Textarea',
      controls: ['state', 'form-intent', 'textarea-options'],
      states: ['normal', 'hover', 'focus', 'filled', 'disabled', 'display-only'],
      usage: {
        useWhen: [
          'Collecting multi-line free-form text — descriptions, notes, comments.',
          'The expected input length exceeds a single line.',
          'Add <code>readonly</code> to create a <strong>display-only</strong> field that loads or presents data without being editable. Background is transparent to distinguish it from editable fields.',
        ],
        avoidWhen: [
          'Input is short and single-line — use a text input instead.',
          'The user must choose from fixed options — use select or checkboxes.',
        ],
        do: [
          'Set a meaningful <code>rows</code> attribute to reflect the expected content length.',
          'Include a character counter in the label using <code>&lt;small&gt;</code>.',
          'Use <code>aria-invalid="true"</code> + <code>.pos-form-error</code> for errors.',
        ],
        dont: [
          'Use <code>resize: none</code> unless the layout requires it — let users resize.',
          'Use placeholder text as a substitute for a label.',
        ],
        accessibility: [
          'Always associate a visible <code>&lt;label&gt;</code> with the textarea.',
          'Link error messages via <code>aria-describedby</code>.',
        ],
      },
    },
    select: {
      name: 'Select',
      controls: ['select-state', 'form-intent', 'select-options'],
      states: ['closed', 'hover', 'focus', 'opened', 'filled', 'disabled'],
      usage: {
        useWhen: [
          'The user must choose one option from a long list (5+) of predefined values.',
          'Space is limited and a dropdown is more compact than radio buttons.',
          'Use <code>disabled</code> + a pre-selected value to create a <strong>display-only</strong> field that loads or presents data without being editable.',
        ],
        avoidWhen: [
          'There are fewer than 5 options — use radio buttons instead.',
          'Multiple selections are needed — use a multiselect instead.',
        ],
        do: [
          'Always include an empty placeholder option (value="") as the first option.',
          'Use <code>required</code> when the field must be filled before submission.',
          'Pair with <code>.pos-form-error</code> / <code>.pos-form-success</code> for validation feedback.',
        ],
        dont: [
          'Pre-select a real value on initial load — leave the placeholder option selected.',
        ],
        accessibility: [
          'Associate a <code>&lt;label&gt;</code> via matching <code>for</code> and <code>id</code>.',
          'Use <code>aria-invalid</code> and link error messages via <code>aria-describedby</code>.',
        ],
      },
    },
    multiselect: {
      name: 'Multiselect',
      controls: ['multiselect-state', 'multiselect-options'],
      states: ['closed', 'hover', 'focus', 'opened', 'filled', 'disabled'],
      usage: {
        useWhen: [
          'Letting users select multiple values from a defined list — tags, categories, filters, permissions.',
          'The set of choices is too long for a group of checkboxes (more than 5–7 options).',
          'Selected items should be visible inline without opening a panel.',
        ],
        avoidWhen: [
          'Only one item can ever be selected — use a <code>select</code> element instead.',
          'The list has fewer than 5 options — inline checkboxes are more accessible.',
        ],
        do: [
          'Always associate a visible <code>&lt;label&gt;</code> with the multiselect via <code>id</code>.',
          'Pre-select the most common choices when a sensible default exists.',
          'Use <code>multiline</code> when several items are likely to be selected at once and the layout has vertical room to spare — instead of growing wider, the field keeps its default width and wraps the selected tags onto extra lines.',
          'Use <code>combined</code> when the list is long and the field must stay a predictable, compact width regardless of how many items get selected — it replaces the individual tags with a single "N selected" summary once 2 or more are chosen.',
          'Use <code>showFilter</code> when the option list is long enough that scanning it is slower than typing a few letters to narrow it down (roughly 10+ options).',
        ],
        dont: [
          'Use multiselect for binary or single-choice selection — use checkboxes or a select instead.',
          'Leave the placeholder blank — always describe what kind of options are inside.',
          'Combine <code>multiline</code> and <code>combined</code> on the same instance — they solve the same "too many tags" problem in opposite ways (wrap vs. summarize), so only one should be enabled at a time.',
          'Enable <code>showFilter</code> on a short list (under ~10 options) — it adds a step for no benefit.',
        ],
        accessibility: [
          'Every multiselect must have a programmatically associated <code>&lt;label&gt;</code>.',
          'The input container has <code>tabindex="0"</code> and <code>aria-expanded</code> to announce open/closed state to screen readers.',
          'Each option uses a <code>&lt;checkbox&gt;</code> so screen readers can navigate and toggle individual items.',
        ],
      },
    },
    password: {
      name: 'Password input',
      controls: ['password-state', 'password-options'],
      states: [],
      usage: {
        useWhen: [
          'Collecting a password, PIN, or any value the user should not see while typing.',
          'The input must allow the user to toggle visibility — always provide the show/hide toggle.',
        ],
        avoidWhen: [
          'Collecting non-sensitive text — use a regular text input instead.',
          'The value does not need to be hidden — a masked input creates unnecessary friction.',
        ],
        do: [
          'Always provide a show/hide toggle so users can verify their input.',
          'Use the strength meter on registration and password-change forms — it gives immediate feedback.',
          'Pair the strength meter with a strength description for screen readers (<code>aria-live</code> on the description).',
        ],
        dont: [
          'Hide the show/hide toggle — users who type on mobile need it most.',
          'Show the strength meter on login forms — it is irrelevant and distracting there.',
          'Use <code>autocomplete="off"</code> — this breaks password managers and reduces security.',
        ],
        accessibility: [
          'The show/hide toggle must have a meaningful <code>aria-label</code> or <code>title</code> (e.g. "Show password").',
          'The strength meter description uses <code>aria-live="polite"</code> so screen readers announce strength changes.',
          'Password input should have <code>autocomplete="current-password"</code> on login forms and <code>autocomplete="new-password"</code> on registration forms.',
        ],
      },
    },
    tooltip: {
      name: 'Tooltip',
      controls: ['tooltip-type', 'tooltip-state'],
      states: ['normal', 'visible'],
      tokens: [],
      usage: {
        useWhen: [
          'Icon-only controls — every icon-only button/action always needs one (RULES.md 4.2), reusing its own aria-label text.',
          'A short, supplementary hint that clarifies an already-visible control\'s purpose (e.g. confirming what a "+" button adds).',
          'Icon-text type: a hint that needs a little more than a label — an icon and one or two short lines (the second bold).',
        ],
        avoidWhen: [
          'Content the user must be able to select, copy, or interact with — a tooltip disappears on blur/mouseout and cannot hold focus.',
          'Essential information with no other way to discover it — a tooltip is a supplement, never the only source of an instruction.',
          'Touch-only interfaces with no hover/focus-visible equivalent — provide a visible label or a tap-triggered alternative instead.',
        ],
        do: [
          'Always set the exact same text in both aria-label and data-tooltip on the target element — the tooltip is a visual echo of the accessible name, not separate content.',
          'Keep the text to a few words — the bubble does not wrap (white-space: nowrap).',
          'Icon-text type: wrap the control in .pos-tooltip-anchor, put the .pos-tooltip bubble right after it with role="tooltip" and an id, and point the control\'s aria-describedby at that id.',
        ],
        dont: [
          'Put interactive content (links, buttons) inside a tooltip — it disappears the moment focus/hover moves toward it.',
          'Use a tooltip as the only label for a control that also needs a real aria-label — always pair the two.',
          'Use the icon-text type for a long explanation or a link — use a popover instead.',
        ],
        accessibility: [
          'Shown on both :hover AND :focus-visible, so keyboard users see the same information mouse users do.',
          'Purely visual/supplementary — screen readers announce the element\'s own aria-label, not the tooltip bubble, so the two must always carry the same text.',
          'pointer-events: none on the bubble itself — it can never trap focus or intercept a click meant for the element underneath it.',
          'Icon-text type: the bubble is real text (role="tooltip") announced as the control\'s description through aria-describedby; the icon is decorative. It shows on hover and while focus is inside the anchor.',
        ],
      },
    },
    "breadcrumb": {
      name: "Breadcrumb",
      controls: ["breadcrumb-variant","state"],
      states: ["normal","hover","focus"],
      tokens: [],
      usage: {
        useWhen: [
          "Showing the user's location within a nested page hierarchy (e.g. Category > Subcategory > Product).",
          "Letting the user jump back up to any ancestor page in one click.",
          "The hierarchy has at least two levels above the current page.",
        ],
        avoidWhen: [
          "Navigation is flat/single-level — a breadcrumb with only the current page adds no value.",
          "The full path would be longer and more confusing to scan than the page's own title or a back button.",
        ],
        do: [
          "Keep each label short and match the real title of the page it links to.",
          "Always show the current page last, as plain non-link text.",
          "Let the component collapse automatically when it doesn't fit its container — never truncate labels with CSS ellipsis instead.",
        ],
        dont: [
          "Make the current page a clickable link — it isn't navigable to itself.",
          "Use a breadcrumb as the only way to reach a page — it supplements primary navigation, it doesn't replace it.",
          "Invent labels that differ from the actual page titles in the hierarchy.",
        ],
        accessibility: [
          "The root element is a <nav aria-label=\"Breadcrumb\"> so assistive tech announces it as a distinct landmark.",
          "The current page uses aria-current=\"page\", not a visual-only style.",
          "Separator icons are aria-hidden — they're purely decorative, the list structure itself conveys order.",
          "The collapsed-state back button has a real aria-label (e.g. \"Show parent pages\") since its icon alone conveys no accessible name.",
        ],
      },
    },
    "badge": {
      name: "Badge",
      controls: ["badge-variant","badge-size","badge-intent"],
      states: ["normal"],
      tokens: [],
      usage: {
        useWhen: [
          "Signalling that something new is waiting on an icon or avatar — a dot, no number (e.g. new messages on a bell).",
          "Showing a small unread / pending count on an icon or tab — a number, or the max-count \"99+\" form when it gets large.",
        ],
        avoidWhen: [
          "The information is a status or category with words — use a Tag or a Chip.",
          "The message is important enough that the user must not miss it — use an Alert card or a Toast; a badge is a quiet, glanceable supplement.",
          "The label would need more than a few characters — badges hold a dot, a number or \"99+\" only.",
        ],
        do: [
          "Place the badge at the top-right corner of the element it belongs to, overlapping its edge.",
          "Switch to the max-count form above 99 (\"99+\") so the badge never grows wide.",
          "Use the small size on small icons (16px) and the big size on larger icons, avatars or tabs.",
        ],
        dont: [
          "Make the badge itself clickable — it describes its anchor element, which is the interactive part.",
          "Put more than one badge on the same element.",
          "Use a badge for status words or long text.",
        ],
        accessibility: [
          "The badge is visual only: put the meaning into the anchor's accessible name (e.g. aria-label=\"Notifications, 3 unread\") — screen readers don't announce a bare number in context.",
          "A dot badge has no text: mark it aria-hidden=\"true\" and say \"new\" in the anchor's label.",
          "The white (background-colored) ring keeps the badge visible on any background — don't remove it.",
        ],
      },
    },
    "slider": {
      name: "Slider",
      controls: ["state"],
      states: ["normal","focus"],
      tokens: [],
      usage: {
        useWhen: [
          "Choosing an approximate value from a continuous range where the position matters more than the exact number (volume, opacity, a percentage).",
          "Giving immediate visual feedback while the value changes.",
        ],
        avoidWhen: [
          "The user needs to enter an exact number — use a text input (type=\"number\").",
          "There are only a few distinct options — use a segmented control, radio buttons or a select.",
          "The range is very large (e.g. 0–10 000) — a small handle can't pick precise values; use an input.",
        ],
        do: [
          "Give it a visible label (or at least an aria-label) that says what is being set.",
          "Show the current value next to the slider too when it matters after letting go — the tooltip only shows while dragging.",
          "Keep the default range 0–100 unless the context needs another one (set min / max / step on the input).",
        ],
        dont: [
          "Use a slider for an on / off choice — use a toggle button.",
          "Hide the track or the fill — the filled part is how the value is read at a glance.",
          "Make it narrower than about 160px — the handle needs room to move.",
        ],
        accessibility: [
          "It is a native range input: arrow keys, Page Up / Down, Home / End and screen readers work without extra code; label it with <label for> or aria-label.",
          "The value tooltip is visual only (aria-hidden) — the input itself announces its value.",
          "The keyboard focus ring sits on the input (the regular DS focus color).",
        ],
      },
    },
    "dropdown-button": {
      name: "Dropdown button",
      controls: ["state"],
      states: ["normal","hover","focus","active","disabled"],
      tokens: [],
      usage: {
        useWhen: [
          "One entry point for a few related actions of the same kind (e.g. several things the user can add).",
          "The page already has its primary action and the related choices would crowd the toolbar as separate buttons.",
        ],
        avoidWhen: [
          "There is only one action — use a plain primary button.",
          "The options are settings or a value the user picks — use a select or a segmented control.",
          "The list is long or needs search — use a popover with a menu or a multiselect.",
        ],
        do: [
          "Keep the list short (2–6 items) and the item labels to one or two words.",
          "Use an icon that says what the actions have in common (e.g. plus for \"add\").",
          "Use links for items that navigate and buttons for items that act on the page.",
        ],
        dont: [
          "Put more than one dropdown button in the same toolbar — it hides the actions.",
          "Nest a second list inside an item.",
        ],
        accessibility: [
          "The trigger is a real <button> with popovertarget — Enter / Space open the list, Esc and clicking outside close it, focus moves to the first item when opened by keyboard.",
          "Arrow up / down, Home and End move between items (the Popover module, loaded by init).",
          "Give the trigger a visible label; the icon is decorative (aria-hidden).",
        ],
      },
    },
  };