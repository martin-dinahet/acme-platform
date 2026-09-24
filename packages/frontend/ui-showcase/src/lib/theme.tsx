import type { CSSProperties, ReactNode } from "react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { readCssVars, type VarTable } from "./css-vars.js";

export type ThemeMode = "system" | "light" | "dark";

type ThemeContextValue = {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  vars: VarTable;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = "acme-ui-showcase:theme";

const readStoredMode = (): ThemeMode => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === "light" || stored === "dark" ? stored : "system";
  } catch {
    return "system";
  }
};

/** Re-reads token values whenever stylesheets change (dev server HMR injects new `<style>` tags). */
const useCssVars = (): VarTable => {
  const [vars, setVars] = useState<VarTable>(() => new Map());
  useEffect(() => {
    const scan = () => setVars(readCssVars());
    scan();
    const observer = new MutationObserver(scan);
    observer.observe(document.head, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, []);
  return vars;
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [mode, setModeState] = useState<ThemeMode>(readStoredMode);
  const vars = useCssVars();

  const value = useMemo<ThemeContextValue>(
    () => ({
      mode,
      vars,
      setMode: (next) => {
        setModeState(next);
        try {
          localStorage.setItem(STORAGE_KEY, next);
        } catch {
          // Storage is optional. The choice then lasts for this visit only.
        }
      },
    }),
    [mode, vars],
  );

  return <ThemeContext value={value}>{children}</ThemeContext>;
};

export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used inside <ThemeProvider>");
  return context;
};

/**
 * Tokens follow `prefers-color-scheme`, which a page cannot toggle. To force a scheme on a subtree,
 * re-declare every scheme-dependent var on it with that scheme's value.
 */
export const useSchemeStyle = (mode: ThemeMode): CSSProperties => {
  const { vars } = useTheme();
  return useMemo(() => {
    if (mode === "system") return {};
    const style: Record<string, string> = { colorScheme: mode };
    for (const [name, values] of vars) {
      if (values.dark === undefined) continue;
      const value = values[mode];
      if (value !== undefined) style[name] = value;
    }
    return style as CSSProperties;
  }, [vars, mode]);
};
