type Rgb = [number, number, number];

/** Parses `#rgb`, `#rgba`, `#rrggbb` and `#rrggbbaa`. Alpha is ignored. Other formats return `null`. */
const parseHex = (value: string): Rgb | null => {
  const hex = /^#([0-9a-f]{3,8})$/i.exec(value.trim())?.[1];
  if (!hex || hex.length === 5 || hex.length === 7) return null;
  const full = hex.length <= 4 ? [...hex].map((char) => char + char).join("") : hex;
  return [0, 2, 4].map((offset) => Number.parseInt(full.slice(offset, offset + 2), 16)) as Rgb;
};

const luminance = ([r, g, b]: Rgb) => {
  const [lr, lg, lb] = [r, g, b].map((channel) => {
    const c = channel / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  }) as Rgb;
  return 0.2126 * lr + 0.7152 * lg + 0.0722 * lb;
};

/** WCAG 2 contrast ratio, or `null` when a value is not a hex color. */
export const contrastRatio = (foreground: string, background: string): number | null => {
  const fg = parseHex(foreground);
  const bg = parseHex(background);
  if (!fg || !bg) return null;
  const [high, low] = [luminance(fg), luminance(bg)].sort((a, b) => b - a) as [number, number];
  return (high + 0.05) / (low + 0.05);
};

export type ContrastGrade = "AAA" | "AA" | "AA large" | "Fail";

export const gradeOf = (ratio: number): ContrastGrade =>
  ratio >= 7 ? "AAA" : ratio >= 4.5 ? "AA" : ratio >= 3 ? "AA large" : "Fail";
