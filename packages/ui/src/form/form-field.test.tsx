import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { z } from "zod";
import { useZodForm, FormField } from "./form-field";
import { Input } from "../components/ui/input.js";

const schema = z.object({
  razonSocial: z.string().min(1, "Razón social requerida"),
});

function TestForm({ onSubmit }: { onSubmit: (v: z.infer<typeof schema>) => void }) {
  const form = useZodForm(schema, { defaultValues: { razonSocial: "" } });
  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FormField name="razonSocial" label="Razón social" form={form}>
        {(field) => <Input {...field} />}
      </FormField>
      <button type="submit">Guardar</button>
    </form>
  );
}

describe("useZodForm + FormField", () => {
  it("shows the Zod error message when the field is invalid on submit", async () => {
    const user = userEvent.setup();
    render(<TestForm onSubmit={vi.fn()} />);
    await user.click(screen.getByText("Guardar"));
    expect(await screen.findByText("Razón social requerida")).toBeInTheDocument();
  });

  it("calls onSubmit with parsed values when valid", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<TestForm onSubmit={onSubmit} />);
    await user.type(screen.getByLabelText("Razón social"), "Constructora Andes");
    await user.click(screen.getByText("Guardar"));
    expect(onSubmit).toHaveBeenCalledWith({ razonSocial: "Constructora Andes" }, expect.anything());
  });
});
