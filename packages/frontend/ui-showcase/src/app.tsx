import { Section } from "./components/section.js";
import { type NavGroup, Shell } from "./components/shell.js";
import { COMPONENT_DEMOS } from "./demos/registry.js";
import { ThemeProvider } from "./lib/theme.js";
import { Overview } from "./sections/overview.js";
import { SandboxSection } from "./sections/sandbox.js";
import { TOKEN_GROUPS } from "./tokens/registry.js";
import { TokenSection } from "./tokens/token-section.js";

const tokenEntries = Object.entries(TOKEN_GROUPS);
const componentEntries = Object.entries(COMPONENT_DEMOS);

const tokenId = (name: string) => `token-${name}`;
const componentId = (name: string) => `component-${name.toLowerCase()}`;

const NAV: readonly NavGroup[] = [
  { title: "Start", items: [{ id: "overview", label: "Overview" }] },
  { title: "Tokens", items: tokenEntries.map(([name, def]) => ({ id: tokenId(name), label: def.title })) },
  {
    title: "Components",
    items: componentEntries.map(([name]) => ({ id: componentId(name), label: name })),
  },
  { title: "Sandbox", items: [{ id: "sandbox", label: "Composition" }] },
];

const NAV_IDS = NAV.flatMap((group) => group.items.map((item) => item.id));

export const App = () => (
  <ThemeProvider>
    <Shell nav={NAV} navIds={NAV_IDS}>
      <Overview />
      {tokenEntries.map(([name, def]) => (
        <TokenSection key={name} id={tokenId(name)} name={name} def={def} />
      ))}
      {componentEntries.map(([name, { description, Demo }]) => (
        <Section key={name} id={componentId(name)} eyebrow="Component" title={name} description={description}>
          <Demo />
        </Section>
      ))}
      <SandboxSection />
    </Shell>
  </ThemeProvider>
);
