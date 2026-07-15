import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { axe } from "jest-axe";
import { Dropzone } from "./dropzone.js";

const file = new File(["contenido"], "politica-accesos.pdf", { type: "application/pdf" });

describe("Dropzone", () => {
  it("drop dispara onFiles con los File", () => {
    const onFiles = vi.fn();
    render(<Dropzone onFiles={onFiles} />);
    fireEvent.drop(screen.getByRole("button"), { dataTransfer: { files: [file] } });
    expect(onFiles).toHaveBeenCalledWith([file]);
  });

  it("seleccionar por input dispara onFiles", () => {
    const onFiles = vi.fn();
    const { container } = render(<Dropzone onFiles={onFiles} />);
    const input = container.querySelector<HTMLInputElement>("input[type=file]")!;
    fireEvent.change(input, { target: { files: [file] } });
    expect(onFiles).toHaveBeenCalledWith([file]);
  });

  it("disabled: drop no dispara onFiles", () => {
    const onFiles = vi.fn();
    render(<Dropzone onFiles={onFiles} disabled />);
    fireEvent.drop(screen.getByRole("button"), { dataTransfer: { files: [file] } });
    expect(onFiles).not.toHaveBeenCalled();
  });

  it("drop vacío no dispara onFiles", () => {
    const onFiles = vi.fn();
    render(<Dropzone onFiles={onFiles} />);
    fireEvent.drop(screen.getByRole("button"), { dataTransfer: { files: [] } });
    expect(onFiles).not.toHaveBeenCalled();
  });

  it("axe limpio", async () => {
    const { container } = render(<Dropzone onFiles={() => {}} hint="PDF, DOCX, XLSX" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
