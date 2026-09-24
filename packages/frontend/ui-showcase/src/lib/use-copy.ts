import { useEffect, useRef, useState } from "react";

/** Copies text to the clipboard. `copied` holds the last copied text for 1.5s, for "Copied" feedback. */
export const useCopy = () => {
  const [copied, setCopied] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Clipboard access can be denied. Nothing else to do.
      return;
    }
    setCopied(text);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(null), 1500);
  };

  return { copied, copy };
};
