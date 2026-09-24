/** The value a CSS custom property takes in each color scheme, as written in the compiled stylesheet. */
export type VarValues = { light?: string; dark?: string };
export type VarTable = ReadonlyMap<string, VarValues>;

const DARK_QUERY = /prefers-color-scheme:\s*dark/;

const collect = (rules: CSSRuleList, dark: boolean, out: Map<string, VarValues>) => {
  for (const rule of Array.from(rules)) {
    if (rule instanceof CSSStyleRule) {
      for (const property of Array.from(rule.style)) {
        if (!property.startsWith("--")) continue;
        const entry = out.get(property) ?? {};
        entry[dark ? "dark" : "light"] = rule.style.getPropertyValue(property).trim();
        out.set(property, entry);
      }
    }
    if (rule instanceof CSSMediaRule) {
      collect(rule.cssRules, dark || DARK_QUERY.test(rule.conditionText), out);
    } else if ("cssRules" in rule) {
      // @layer, @supports and nested style rules keep the current scheme.
      collect((rule as CSSGroupingRule).cssRules, dark, out);
    }
  }
};

/**
 * Reads every custom property declared in the page's stylesheets, split by color scheme.
 * Reading the compiled CSS (not the token source) means the showcase can never drift from what ships.
 */
export const readCssVars = (): VarTable => {
  const out = new Map<string, VarValues>();
  for (const sheet of Array.from(document.styleSheets)) {
    try {
      collect(sheet.cssRules, false, out);
    } catch {
      // Cross-origin sheets are unreadable. None of them hold design tokens.
    }
  }
  return out;
};
