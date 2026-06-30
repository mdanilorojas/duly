import { createContext, useContext } from "react";
import type { Density } from "./trace-log.variants.js";

export const DensityContext = createContext<Density>("comfortable");
export const useDensity = (): Density => useContext(DensityContext);

export const StreamingContext = createContext<boolean>(false);
export const useStreaming = (): boolean => useContext(StreamingContext);
