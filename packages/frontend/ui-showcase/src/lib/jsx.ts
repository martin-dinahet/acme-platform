/** `{ expr }` prints as a JS expression, e.g. `checked={checked}`. */
export type JsxProp = string | number | boolean | { expr: string } | undefined;

type PrintedProp = Exclude<JsxProp, undefined | false>;

const formatProp = ([name, value]: [string, PrintedProp]) => {
  if (value === true) return name;
  if (typeof value === "number") return `${name}={${value}}`;
  if (typeof value === "object") return `${name}={${value.expr}}`;
  return `${name}=${JSON.stringify(value)}`;
};

/** Prints a JSX element for the playground code panels. `undefined` and `false` props are left out. */
export const formatJsx = (name: string, props: Record<string, JsxProp>, children?: string): string => {
  const attrs = Object.entries(props)
    .filter((entry): entry is [string, PrintedProp] => entry[1] !== undefined && entry[1] !== false)
    .map(formatProp);
  const open = attrs.length === 0 ? name : `${name} ${attrs.join(" ")}`;
  const oneLine = children ? `<${open}>${children}</${name}>` : `<${open} />`;
  if (oneLine.length <= 80) return oneLine;

  const multiAttrs = attrs.map((attr) => `\n  ${attr}`).join("");
  return children ? `<${name}${multiAttrs}\n>\n  ${children}\n</${name}>` : `<${name}${multiAttrs}\n/>`;
};
