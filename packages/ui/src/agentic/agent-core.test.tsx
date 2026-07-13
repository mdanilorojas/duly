import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { AgentCore } from "./agent-core.js";
import { NEURAL_AGENTS } from "./neural-agents.js";

describe("AgentCore — renderer WebGL compartido", () => {
  it("renderiza múltiples instancias simultáneas sin lanzar (jsdom sin WebGL -> fallback estático)", () => {
    const { container } = render(
      <>
        <AgentCore agent={NEURAL_AGENTS[0]} />
        <AgentCore agent={NEURAL_AGENTS[1]} />
        <AgentCore agent={NEURAL_AGENTS[2]} />
      </>,
    );
    expect(container.querySelectorAll('[aria-hidden]').length).toBe(3);
    expect(container.querySelectorAll("canvas").length).toBe(0);
  });

  it("cada fallback usa el glow del agente correspondiente, no uno compartido por error", () => {
    const { container } = render(
      <>
        <AgentCore agent={NEURAL_AGENTS[0]} />
        <AgentCore agent={NEURAL_AGENTS[1]} />
      </>,
    );
    const fallbacks = container.querySelectorAll('[aria-hidden]');
    const bg0 = (fallbacks[0] as HTMLElement).style.background;
    const bg1 = (fallbacks[1] as HTMLElement).style.background;
    expect(bg0).toContain("radial-gradient");
    expect(bg0).not.toBe(bg1);
  });

  it("desmontar una instancia no rompe ni afecta a una hermana que sigue montada", () => {
    const { container, rerender } = render(
      <>
        <AgentCore agent={NEURAL_AGENTS[0]} />
        <AgentCore agent={NEURAL_AGENTS[1]} />
      </>,
    );
    expect(container.querySelectorAll('[aria-hidden]').length).toBe(2);
    rerender(<AgentCore agent={NEURAL_AGENTS[1]} />);
    expect(container.querySelectorAll('[aria-hidden]').length).toBe(1);
  });

  it("respeta prefers-reduced-motion sin lanzar", () => {
    const original = window.matchMedia;
    window.matchMedia = ((query: string) => ({
      matches: query.includes("prefers-reduced-motion"),
      media: query,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
      onchange: null,
    })) as unknown as typeof window.matchMedia;

    const { container } = render(<AgentCore agent={NEURAL_AGENTS[0]} />);
    expect(container.querySelector('[aria-hidden]')).not.toBeNull();

    window.matchMedia = original;
  });
});
