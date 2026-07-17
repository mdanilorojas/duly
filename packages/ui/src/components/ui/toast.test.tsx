import { describe, it, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { Toaster, toast } from "./toast";

describe("Toaster", () => {
  it("renders a toast with title and description when toast() is called", async () => {
    render(<Toaster />);
    toast({ title: "Invitación enviada", description: "andrea@empresa.com" });
    await waitFor(() => {
      expect(screen.getByText("Invitación enviada")).toBeInTheDocument();
      expect(screen.getByText("andrea@empresa.com")).toBeInTheDocument();
    });
  });

  it("applies the error variant's styling class", async () => {
    render(<Toaster />);
    toast({ title: "No se pudo guardar", variant: "error" });
    await waitFor(() => {
      const el = screen.getByText("No se pudo guardar").closest("[data-variant]");
      expect(el).toHaveAttribute("data-variant", "error");
    });
  });

  it("dismisses automatically after the default duration", async () => {
    render(<Toaster />);
    toast({ title: "Guardado", durationMs: 50 });
    await waitFor(() => expect(screen.getByText("Guardado")).toBeInTheDocument());
    await waitFor(() => expect(screen.queryByText("Guardado")).not.toBeInTheDocument(), { timeout: 500 });
  });
});
