import * as stylex from "@stylexjs/stylex";

const DARK = "@media (prefers-color-scheme: dark)";

/**
 * Design tokens for @acme/ui. Every component styles itself exclusively
 * from these vars, so the whole package re-themes from one place.
 */
export const color = stylex.defineVars({
  bg: { default: "#ffffff", [DARK]: "#111318" },
  bgSubtle: { default: "#f5f6f8", [DARK]: "#1a1d24" },
  border: { default: "#dde1e7", [DARK]: "#2c313b" },
  text: { default: "#15171c", [DARK]: "#ecedf1" },
  textMuted: { default: "#5b6270", [DARK]: "#9aa1ad" },
  accent: { default: "#3358d4", [DARK]: "#7c9bff" },
  accentText: { default: "#ffffff", [DARK]: "#0b1020" },
  danger: { default: "#c4362f", [DARK]: "#ff8078" },
  dangerText: { default: "#ffffff", [DARK]: "#2a0b09" },
  focusRing: { default: "#3358d4", [DARK]: "#7c9bff" },
});

export const space = stylex.defineVars({
  xs: "4px",
  sm: "8px",
  md: "12px",
  lg: "16px",
  xl: "24px",
  xxl: "32px",
});

export const size = stylex.defineVars({
  borderWidth: "1px",
  formMaxWidth: "360px",
  contentMaxWidth: "560px",
});

export const radius = stylex.defineVars({
  sm: "6px",
  md: "10px",
  lg: "14px",
  full: "999px",
});

export const font = stylex.defineVars({
  body: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  sizeSm: "13px",
  sizeMd: "15px",
  sizeLg: "20px",
  weightRegular: "400",
  weightMedium: "500",
  weightBold: "700",
});

export const shadow = stylex.defineVars({
  sm: "0 1px 2px rgba(15, 18, 25, 0.08)",
  md: "0 4px 16px rgba(15, 18, 25, 0.12)",
});
