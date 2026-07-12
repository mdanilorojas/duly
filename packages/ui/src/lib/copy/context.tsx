import * as React from "react";
import { enCopy } from "./en.js";
import { esCopy } from "./es.js";
import type { CopyDict, Locale } from "./types.js";

const DICTS: Record<Locale, CopyDict> = { en: enCopy, es: esCopy };

interface CopyContextValue {
  copy: CopyDict;
  locale: Locale;
  currency: string; // ISO 4217
}

// Zero-setup default — inglés, mismo patrón que
// createContext<Density>("comfortable") en trace-log.context.ts. Ningún
// consumidor necesita envolver en <CopyProvider> para obtener texto correcto.
const CopyContext = React.createContext<CopyContextValue>({
  copy: enCopy,
  locale: "en",
  currency: "USD",
});

export function useCopy(): CopyDict {
  return React.useContext(CopyContext).copy;
}

export function useLocale(): { locale: Locale; currency: string } {
  const { locale, currency } = React.useContext(CopyContext);
  return { locale, currency };
}

export interface CopyProviderProps {
  locale?: Locale;
  /** ISO 4217, ej. "USD" (default) / "EUR". */
  currency?: string;
  /** Override editorial completo — reemplaza el diccionario del locale. */
  copy?: CopyDict;
  children: React.ReactNode;
}

export function CopyProvider({
  locale = "en",
  currency = "USD",
  copy,
  children,
}: CopyProviderProps) {
  const value = React.useMemo<CopyContextValue>(
    () => ({ copy: copy ?? DICTS[locale], locale, currency }),
    [copy, locale, currency],
  );
  return <CopyContext.Provider value={value}>{children}</CopyContext.Provider>;
}

/**
 * Formatea un monto vía Intl.NumberFormat, sensible a locale/currency del
 * CopyProvider más cercano — reemplaza el `$${n.toFixed(2)}` hardcoded que
 * se repetía en TokenCostMeter/AgentTopologyGraph/TraceTree. Conserva el
 * comportamiento previo (4 decimales bajo $0.01, 2 decimales el resto).
 */
export function useFormatCurrency(): (amount: number) => string {
  const { locale, currency } = useLocale();
  return React.useMemo(() => {
    const two = new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    const four = new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    });
    return (amount: number) => (amount > 0 && amount < 0.01 ? four : two).format(amount);
  }, [locale, currency]);
}
