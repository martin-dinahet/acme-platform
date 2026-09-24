import type { VarTable, VarValues } from "./css-vars.js";

export type Token = {
  /** Key inside its group, e.g. `bgSubtle`. */
  key: string;
  /** What StyleX gives at runtime, e.g. `var(--x1phd8ca)`. Usable directly in inline styles. */
  ref: string;
  /** The custom property name, e.g. `--x1phd8ca`. */
  cssVar: string;
};

const VAR_REF = /^var\((--[\w-]+)\)$/;

/** Lists the tokens of a `defineVars` group. StyleX adds private keys (e.g. `__varGroupHash__`) that are skipped. */
export const tokensOf = (group: object): Token[] =>
  Object.entries(group).flatMap(([key, ref]) => {
    const match = typeof ref === "string" ? VAR_REF.exec(ref) : null;
    return match?.[1] ? [{ key, ref, cssVar: match[1] }] : [];
  });

export const valuesOf = (vars: VarTable, token: Token): VarValues => vars.get(token.cssVar) ?? {};
