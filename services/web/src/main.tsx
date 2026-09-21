import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./app.js";

// biome-ignore lint/style/noNonNullAssertion: root element is defined in index.html
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
