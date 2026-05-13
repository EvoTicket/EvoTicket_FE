"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

const DEFAULT_COLOR_FALLBACK = "currentColor";
const subscribe = () => () => {};

/**
 * Reads a CSS custom property value at runtime so Recharts SVG props
 * (which don't accept CSS variables) can stay theme-aware.
 *
 * Usage:
 *   const brandColor = useTokenColor("--color-action-brand-bg-default");
 *   <Area stroke={brandColor} />
 */
export function useTokenColor(
  cssVarName: string,
  fallback = DEFAULT_COLOR_FALLBACK
): string {
  const getSnapshot = useCallback(() => {
    if (typeof window === "undefined") return fallback;

    const root = document.documentElement;
    const value = getComputedStyle(root).getPropertyValue(cssVarName).trim();
    return value || fallback;
  }, [cssVarName, fallback]);

  return useSyncExternalStore(subscribe, getSnapshot, () => fallback);
}

/**
 * Batch-read multiple CSS variables at once.
 *
 * Usage:
 *   const colors = useTokenColors({
 *     brand: "--color-action-brand-bg-default",
 *     success: "--color-feedback-success-icon",
 *   });
 *   <Bar fill={colors.brand} />
 */
export function useTokenColors<K extends string>(
  map: Record<K, string>,
  fallback = DEFAULT_COLOR_FALLBACK
): Record<K, string> {
  const getSnapshot = useCallback(() => {
    const result = {} as Record<K, string>;

    if (typeof window === "undefined") {
      for (const k of Object.keys(map) as K[]) result[k] = fallback;
      return JSON.stringify(result);
    }

    const root = document.documentElement;
    const style = getComputedStyle(root);
    for (const k of Object.keys(map) as K[]) {
      const v = style.getPropertyValue(map[k]).trim();
      result[k] = v || fallback;
    }

    return JSON.stringify(result);
  }, [map, fallback]);

  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  return useMemo(() => JSON.parse(snapshot) as Record<K, string>, [snapshot]);
}
