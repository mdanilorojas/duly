import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@duly/ui/styles.css";
import "@duly/ui/reset.css";
import "@xyflow/react/dist/style.css";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
