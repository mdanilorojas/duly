"use client";

import * as React from "react";
import { useForm, type UseFormReturn, type UseFormProps, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { Label } from "../components/ui/label.js";

export function useZodForm<S extends z.ZodType>(
  schema: S,
  options?: Omit<UseFormProps<z.infer<S>>, "resolver">,
): UseFormReturn<z.infer<S>> {
  return useForm<z.infer<S>>({ ...options, resolver: zodResolver(schema) });
}

interface FormFieldProps<S extends z.ZodType> {
  name: keyof z.infer<S> & string;
  label: string;
  form: UseFormReturn<z.infer<S>>;
  children: (field: { name: string; value: unknown; onChange: (v: unknown) => void; onBlur: () => void; id: string }) => React.ReactNode;
}

export function FormField<S extends z.ZodType>({ name, label, form, children }: FormFieldProps<S>) {
  const error = form.formState.errors[name as string];
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={name}>{label}</Label>
      <Controller
        control={form.control}
        name={name as never}
        render={({ field }) => <>{children({ ...field, id: name })}</>}
      />
      {error && <p className="text-sm text-block">{String(error.message)}</p>}
    </div>
  );
}
