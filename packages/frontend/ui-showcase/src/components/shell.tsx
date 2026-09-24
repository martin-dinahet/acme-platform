import { color, font, radius, size, space } from "@acme/ui/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { type ThemeMode, useSchemeStyle, useTheme } from "../lib/theme.js";
import { Segmented } from "./segmented.js";

const MOBILE = "@media (max-width: 800px)";

const styles = stylex.create({
  page: {
    minHeight: "100dvh",
    backgroundColor: color.bgSubtle,
    color: color.text,
    fontFamily: font.body,
  },
  header: {
    position: "sticky",
    top: 0,
    zIndex: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: space.lg,
    height: "56px",
    paddingInline: space.lg,
    backgroundColor: `color-mix(in srgb, ${color.bg} 85%, transparent)`,
    backdropFilter: "blur(8px)",
    borderBottomStyle: "solid",
    borderBottomWidth: size.borderWidth,
    borderBottomColor: color.border,
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: space.sm,
    fontSize: font.sizeMd,
    fontWeight: font.weightBold,
    color: color.text,
    textDecoration: "none",
  },
  logo: {
    width: "22px",
    height: "22px",
    borderRadius: radius.sm,
    backgroundImage: `linear-gradient(135deg, ${color.accent}, color-mix(in srgb, ${color.accent} 40%, ${color.danger}))`,
  },
  brandMuted: {
    fontWeight: font.weightRegular,
    color: color.textMuted,
    display: { default: "inline", [MOBILE]: "none" },
  },
  body: {
    display: "grid",
    gridTemplateColumns: { default: "232px minmax(0, 1fr)", [MOBILE]: "minmax(0, 1fr)" },
  },
  nav: {
    position: "sticky",
    top: "56px",
    zIndex: { default: "auto", [MOBILE]: 5 },
    alignSelf: "start",
    display: "flex",
    flexDirection: { default: "column", [MOBILE]: "row" },
    gap: { default: space.xl, [MOBILE]: space.lg },
    maxHeight: { default: "calc(100dvh - 56px)", [MOBILE]: "none" },
    overflowY: { default: "auto", [MOBILE]: "visible" },
    overflowX: { default: "visible", [MOBILE]: "auto" },
    paddingBlock: { default: space.xl, [MOBILE]: space.sm },
    paddingInline: space.lg,
    backgroundColor: { default: "transparent", [MOBILE]: color.bg },
    borderRightStyle: { default: "solid", [MOBILE]: "none" },
    borderRightWidth: size.borderWidth,
    borderRightColor: color.border,
    borderBottomStyle: { default: "none", [MOBILE]: "solid" },
    borderBottomWidth: size.borderWidth,
    borderBottomColor: color.border,
  },
  navGroup: {
    display: "flex",
    flexDirection: { default: "column", [MOBILE]: "row" },
    alignItems: { default: "stretch", [MOBILE]: "center" },
    gap: "2px",
    flexShrink: 0,
  },
  navTitle: {
    marginBottom: { default: space.xs, [MOBILE]: 0 },
    marginRight: { default: 0, [MOBILE]: space.xs },
    paddingInline: space.sm,
    fontSize: "11px",
    fontWeight: font.weightBold,
    color: color.textMuted,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    whiteSpace: "nowrap",
  },
  navLink: {
    paddingBlock: "6px",
    paddingInline: space.sm,
    borderRadius: radius.sm,
    fontSize: font.sizeSm,
    color: { default: color.textMuted, ":hover": color.text },
    backgroundColor: { default: "transparent", ":hover": color.bg },
    textDecoration: "none",
    whiteSpace: "nowrap",
    outline: "none",
    ":focus-visible": {
      boxShadow: `0 0 0 2px ${color.focusRing}`,
    },
  },
  navLinkActive: {
    color: color.accent,
    fontWeight: font.weightMedium,
    backgroundColor: `color-mix(in srgb, ${color.accent} 10%, transparent)`,
  },
  main: {
    width: "100%",
    maxWidth: "1040px",
    marginInline: "auto",
    paddingInline: { default: space.xxl, [MOBILE]: space.lg },
    paddingBottom: "96px",
  },
});

export type NavGroup = {
  title: string;
  items: readonly { id: string; label: string }[];
};

/** Tracks which section is in view, to highlight it in the sidebar. */
const useActiveSection = (ids: readonly string[]) => {
  const [active, setActive] = useState<string | undefined>(ids[0]);

  useEffect(() => {
    // The active section is the last one whose top has passed a line just under the sticky header.
    const update = () => {
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
      const passed = ids.filter(
        (id) => (document.getElementById(id)?.getBoundingClientRect().top ?? 0) <= 120,
      );
      setActive(atBottom ? ids.at(-1) : (passed.at(-1) ?? ids[0]));
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [ids]);

  return active;
};

const THEME_MODES: readonly ThemeMode[] = ["system", "light", "dark"];

type ShellProps = {
  nav: readonly NavGroup[];
  navIds: readonly string[];
  children: ReactNode;
};

export const Shell = ({ nav, navIds, children }: ShellProps) => {
  const { mode, setMode } = useTheme();
  const schemeStyle = useSchemeStyle(mode);
  const active = useActiveSection(navIds);
  const pageProps = stylex.props(styles.page);

  return (
    <div className={pageProps.className} style={{ ...pageProps.style, ...schemeStyle }}>
      <header {...stylex.props(styles.header)}>
        <a href="#overview" {...stylex.props(styles.brand)}>
          <span {...stylex.props(styles.logo)} aria-hidden="true" />
          Acme UI <span {...stylex.props(styles.brandMuted)}>showcase</span>
        </a>
        <Segmented label="Color scheme" options={THEME_MODES} value={mode} onChange={setMode} />
      </header>
      <div {...stylex.props(styles.body)}>
        <nav aria-label="Sections" {...stylex.props(styles.nav)}>
          {nav.map((group) => (
            <div key={group.title} {...stylex.props(styles.navGroup)}>
              <span {...stylex.props(styles.navTitle)}>{group.title}</span>
              {group.items.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  aria-current={active === item.id ? "location" : undefined}
                  {...stylex.props(styles.navLink, active === item.id && styles.navLinkActive)}
                >
                  {item.label}
                </a>
              ))}
            </div>
          ))}
        </nav>
        <main {...stylex.props(styles.main)}>{children}</main>
      </div>
    </div>
  );
};
