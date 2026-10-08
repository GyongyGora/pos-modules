/* Shared loose shapes for the spec-JSON-derived data (tokens/components/*.json, loaded into
   COMPONENT_SPECS at runtime, and COMP_CONFIGS below). Deliberately loose (`[key: string]: any`
   escape hatches) rather than an exhaustive schema — this pass's goal is catching real
   cross-file mistakes (wrong param count, typo'd property access), not modeling every spec
   file's full shape. */

export interface Token {
  css: string;
  figma?: string | null;
  swatch?: boolean;
  role?: string;
  requiresSelector?: string;
  [key: string]: any;
}

export interface Section {
  heading?: string;
  ref?: string;
  tokens?: Token[];
  [key: string]: any;
}

export interface DisplayToken {
  css: string;
  figma?: string | null;
  swatch: boolean;
  role?: string;
}

export interface DisplaySection {
  heading?: string;
  tokens: DisplayToken[];
}
