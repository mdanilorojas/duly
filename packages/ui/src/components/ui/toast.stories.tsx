import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./button.js";
import { Toaster, toast } from "./toast.js";

const meta: Meta<typeof Toaster> = {
  title: "Primitivas/Retroalimentación/Toast",
  component: Toaster,
};
export default meta;
type S = StoryObj<typeof Toaster>;

export const AllVariants: S = {
  render: () => (
    <div className="flex min-h-screen flex-col items-start gap-3 bg-bg-base p-10">
      <Toaster />
      <Button
        onClick={() =>
          toast({ title: "Guardado", description: "Los cambios se guardaron correctamente." })
        }
      >
        Default
      </Button>
      <Button
        onClick={() =>
          toast({
            title: "Invitación enviada",
            description: "andrea@empresa.com",
            variant: "success",
          })
        }
      >
        Success
      </Button>
      <Button
        onClick={() =>
          toast({
            title: "Revisa los campos",
            description: "2 campos requieren atención.",
            variant: "warning",
          })
        }
      >
        Warning
      </Button>
      <Button
        onClick={() =>
          toast({ title: "No se pudo guardar", description: "Intenta de nuevo.", variant: "error" })
        }
      >
        Error
      </Button>
    </div>
  ),
};
