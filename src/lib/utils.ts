type ClassInput = string | boolean | null | undefined

/** Merge class names, filtering out falsy values */
export function cn(...classes: ClassInput[]): string {
  return classes.filter(Boolean).join(' ')
}

/** Format a number with locale-aware separators */
export function formatNumber(value: number, decimals = 0): string {
  return value.toLocaleString('de-CH', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

/** Clamp a value between min and max */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}
