import { color, font, radius, shadow, size, space } from "@acme/ui/tokens.stylex";
import type { ComponentType } from "react";
import type { VarValues } from "../lib/css-vars.js";
import type { Token } from "../lib/tokens.js";
import { ContrastSection } from "./contrast-table.js";
import {
  ColorPreview,
  FontPreview,
  RadiusPreview,
  ShadowPreview,
  SizePreview,
  SpacePreview,
} from "./previews.js";

export type TokenGroupDef = {
  group: object;
  title: string;
  description: string;
  layout: "grid" | "list";
  Preview: ComponentType<{ token: Token; values: VarValues }>;
  /** Extra content under the tokens, e.g. the contrast table for colors. */
  Extra?: ComponentType;
};

type TokenModule = typeof import("@acme/ui/tokens.stylex");

/**
 * Every token group exported by `@acme/ui/tokens.stylex`, in sidebar order.
 * `satisfies Record<keyof TokenModule, …>` makes typecheck fail when a new group is not showcased.
 * Tokens inside a group are listed at runtime, so new tokens show up with no change here.
 */
export const TOKEN_GROUPS = {
  color: {
    group: color,
    title: "Color",
    description:
      "Semantic colors. Each has a light and a dark value, picked by the OS color scheme. Swatches show light (upper-left) and dark (lower-right).",
    layout: "grid",
    Preview: ColorPreview,
    Extra: ContrastSection,
  },
  space: {
    group: space,
    title: "Space",
    description: "Spacing scale for padding, gaps and margins.",
    layout: "list",
    Preview: SpacePreview,
  },
  size: {
    group: size,
    title: "Size",
    description: "Fixed dimensions: border width and max widths for forms and content columns.",
    layout: "list",
    Preview: SizePreview,
  },
  radius: {
    group: radius,
    title: "Radius",
    description: "Corner radii, from inputs and checkboxes to cards and pills.",
    layout: "grid",
    Preview: RadiusPreview,
  },
  font: {
    group: font,
    title: "Typography",
    description: "Font family, sizes and weights.",
    layout: "list",
    Preview: FontPreview,
  },
  shadow: {
    group: shadow,
    title: "Shadow",
    description: "Elevation. sm for resting surfaces, md for floating ones.",
    layout: "grid",
    Preview: ShadowPreview,
  },
} satisfies Record<keyof TokenModule, TokenGroupDef>;

export type TokenGroupName = keyof typeof TOKEN_GROUPS;
