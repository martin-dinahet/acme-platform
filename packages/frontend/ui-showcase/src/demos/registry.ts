import type { ComponentType } from "react";
import { ButtonDemo } from "./button-demo.js";
import { CalloutDemo } from "./callout-demo.js";
import { CardDemo } from "./card-demo.js";
import { CheckboxDemo } from "./checkbox-demo.js";
import { TextFieldDemo } from "./text-field-demo.js";

export type ComponentDemoDef = {
  description: string;
  Demo: ComponentType;
};

type UiModule = typeof import("@acme/ui");

/**
 * One demo per component exported by `@acme/ui`, in sidebar order.
 * `satisfies Record<keyof UiModule, …>` makes typecheck fail when a new export has no demo.
 */
export const COMPONENT_DEMOS = {
  Button: {
    description: "A styled native button. Four variants, two sizes.",
    Demo: ButtonDemo,
  },
  TextField: {
    description: "A labeled text input with optional description and error message. Built on Base UI Field.",
    Demo: TextFieldDemo,
  },
  Checkbox: {
    description: "A labeled checkbox with an accessible hidden input. Built on Base UI Checkbox.",
    Demo: CheckboxDemo,
  },
  Callout: {
    description: "An inline status or error message, for example a failed request.",
    Demo: CalloutDemo,
  },
  Card: {
    description: "A plain surface to group content. The base container of the system.",
    Demo: CardDemo,
  },
} satisfies Record<keyof UiModule, ComponentDemoDef>;
