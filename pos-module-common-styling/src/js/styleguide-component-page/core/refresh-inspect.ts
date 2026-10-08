import { tokensPanel } from '../panel-resize.js';
import { renderTokenPanel } from '../token-panel.js';
import { state } from './state.js';
import { renderCodePanel } from '../code-snippet.js';



  export function tryRefreshInspect() {
    if (tokensPanel && tokensPanel.classList.contains('comp-tokens-panel--visible')) {
      renderTokenPanel(state.status, state.size);
    }
    /* the code snippet lives under the preview, always visible — no panel-open gate needed */
    renderCodePanel();
  }