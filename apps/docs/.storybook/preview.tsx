import React from "react";
import type { Preview } from "@storybook/react";
import { CopyProvider } from "@duly/ui";
import "./app.css";

const preview: Preview = {
  globalTypes: {
    theme: {
      defaultValue: "cockpit",
      toolbar: {
        items: ["cockpit", "light", "violet"],
        title: "Tema",
      },
    },
    locale: {
      defaultValue: "es",
      toolbar: {
        items: [
          { value: "es", title: "Español" },
          { value: "en", title: "English" },
        ],
        title: "Idioma",
      },
    },
  },
  parameters: {
    viewport: {
      viewports: {
        mobile375: {
          name: "Mobile 375",
          styles: { width: "375px", height: "667px" },
          type: "mobile",
        },
        mobile414: {
          name: "Mobile-L 414",
          styles: { width: "414px", height: "896px" },
          type: "mobile",
        },
        tablet768: {
          name: "Tablet 768",
          styles: { width: "768px", height: "1024px" },
          type: "tablet",
        },
        desktop1280: {
          name: "Desktop 1280",
          styles: { width: "1280px", height: "800px" },
          type: "desktop",
        },
        desktop1440: {
          name: "Desktop 1440",
          styles: { width: "1440px", height: "900px" },
          type: "desktop",
        },
      },
      defaultViewport: "desktop1440",
    },
    options: {
      // Orden de lectura de la IA: fundamentos -> primitivas -> áreas de
      // dominio -> recetas. Sin esto Storybook cae al orden de escaneo de
      // archivos, no al orden conceptual del sidebar.
      storySort: {
        order: ["Fundamentos", "Primitivas", "Agentic", "Compliance", "Comercial", "Industrial", "Recetas"],
      },
    },
  },
  decorators: [
    (Story, ctx) => {
      // Las stories fullscreen (tablas, consolas, grafos, charts) gestionan su
      // propio ancho — no las capamos a 580; solo las de componente suelto.
      const fullscreen = ctx.parameters?.layout === "fullscreen";
      return (
        <CopyProvider locale={ctx.globals.locale === "en" ? "en" : "es"}>
          <div data-theme={ctx.globals.theme} style={{ background: "var(--bg-base)", padding: fullscreen ? 0 : 24 }}>
            {fullscreen ? (
              <Story />
            ) : (
              <div style={{ width: "100%", maxWidth: 580, margin: "0 auto" }}>
                <Story />
              </div>
            )}
          </div>
        </CopyProvider>
      );
    },
  ],
};

export default preview;
