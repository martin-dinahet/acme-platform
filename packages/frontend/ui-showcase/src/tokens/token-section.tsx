import { Mono } from "../components/mono.js";
import { Section } from "../components/section.js";
import { useTheme } from "../lib/theme.js";
import { tokensOf, valuesOf } from "../lib/tokens.js";
import { useCopy } from "../lib/use-copy.js";
import type { TokenGroupDef } from "./registry.js";
import { TokenGrid, TokenList, TokenRow, TokenTile } from "./token-views.js";

type TokenSectionProps = {
  id: string;
  name: string;
  def: TokenGroupDef;
};

export const TokenSection = ({ id, name, def }: TokenSectionProps) => {
  const { vars } = useTheme();
  const { copied, copy } = useCopy();
  const { Preview, Extra } = def;
  const tokens = tokensOf(def.group);
  const [Container, Item] = def.layout === "grid" ? [TokenGrid, TokenTile] : [TokenList, TokenRow];

  return (
    <Section
      id={id}
      eyebrow={`Tokens · ${tokens.length}`}
      title={def.title}
      description={
        <>
          {def.description} Import from <Mono>@acme/ui/tokens.stylex</Mono>. Click a token to copy its path.
        </>
      }
    >
      <Container>
        {tokens.map((token) => {
          const path = `${name}.${token.key}`;
          const values = valuesOf(vars, token);
          return (
            <Item
              key={token.key}
              path={path}
              values={values}
              copied={copied === path}
              onCopy={() => copy(path)}
              preview={<Preview token={token} values={values} />}
            />
          );
        })}
      </Container>
      {Extra && <Extra />}
    </Section>
  );
};
