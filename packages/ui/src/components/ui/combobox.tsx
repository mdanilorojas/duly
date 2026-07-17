"use client";

import { Command, CommandInput, CommandItem, CommandList, CommandEmpty } from "cmdk";
import { cn } from "../../lib/cn.js";

export interface ComboboxProps<T> {
  items: T[];
  value: T | null;
  onChange: (item: T) => void;
  getLabel: (item: T) => string;
  getValue: (item: T) => string;
  placeholder?: string;
  emptyText?: string;
  className?: string;
}

export function Combobox<T>({
  items,
  value,
  onChange,
  getLabel,
  getValue,
  placeholder = "Buscar...",
  emptyText = "Sin resultados.",
  className,
}: ComboboxProps<T>) {
  return (
    <Command className={cn("rounded-md border border-border-default bg-bg-elevated", className)}>
      <CommandInput
        placeholder={placeholder}
        className="w-full px-3 py-2 text-sm outline-none bg-transparent text-ink placeholder:text-faint"
        value={value ? getLabel(value) : undefined}
      />
      <CommandList className="max-h-60 overflow-y-auto">
        <CommandEmpty className="px-3 py-2 text-sm text-faint">{emptyText}</CommandEmpty>
        {items.map((item) => (
          <CommandItem
            key={getValue(item)}
            value={getLabel(item)}
            onSelect={() => onChange(item)}
            className="px-3 py-2 text-sm cursor-pointer aria-selected:bg-accent-surface"
          >
            {getLabel(item)}
          </CommandItem>
        ))}
      </CommandList>
    </Command>
  );
}
