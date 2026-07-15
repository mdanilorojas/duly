import * as React from "react";
import { Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCopy } from "@/lib/copy/index.js";

export interface DropzoneProps
  extends Omit<React.ComponentProps<"button">, "onDrop" | "onClick" | "onDragOver" | "onDragLeave" | "children" | "type"> {
  onFiles: (files: File[]) => void;
  /** Pasa directo al `<input type="file">`. No filtra el drop — la app valida. */
  accept?: string;
  multiple?: boolean;
  /** Título visible; default por copy. */
  label?: string;
  hint?: string;
}

/**
 * Zona de carga presentacional — data rooms, ingesta manual de evidencia.
 * Estados idle/drag-over/disabled; toda la zona es un botón focusable y el
 * `<input type="file">` oculto es el fallback accesible (Enter/Space abre el
 * picker). Cero lógica de upload/hash/custodia: eso es de la app.
 */
export function Dropzone({
  onFiles,
  accept,
  multiple = true,
  disabled,
  label,
  hint,
  className,
  ...props
}: DropzoneProps) {
  const copy = useCopy();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [over, setOver] = React.useState(false);

  const emit = (list: FileList | null) => {
    if (!list || list.length === 0) return;
    onFiles(Array.from(list));
  };

  return (
    <>
      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          if (!disabled) emit(e.dataTransfer.files);
        }}
        className={cn(
          "flex w-full flex-col items-center gap-2 rounded-lg border-2 border-dashed border-border-default bg-bg-elevated px-6 py-8 text-center transition-colors",
          "hover:border-accent-border focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent",
          over && "border-accent-border bg-accent-surface",
          disabled && "cursor-not-allowed opacity-50",
          className,
        )}
        {...props}
      >
        <Upload aria-hidden className="size-5 text-accent" />
        <span className="text-sm font-medium text-ink">{label ?? copy.dropzone.label}</span>
        {hint ? <span className="text-xs text-dim">{hint}</span> : null}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        tabIndex={-1}
        aria-hidden
        className="sr-only"
        onChange={(e) => {
          emit(e.currentTarget.files);
          e.currentTarget.value = "";
        }}
      />
    </>
  );
}
