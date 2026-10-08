/* Ambient global augmentation — `window.pos` is common-styling's own runtime module
   registry (pos-*.js behavior modules attach themselves here), defined outside this
   TypeScript tree entirely (plain JS, loaded separately). Typed as `any` deliberately:
   giving it a real shape is out of scope for this pass (pragmatic typing, not a maximalist rewrite). */
export {};

declare global {
  interface Window {
    pos?: any;
  }
}
