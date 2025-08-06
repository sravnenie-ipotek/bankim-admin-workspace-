/**
 * Type guard to check if a value is not null or undefined
 */
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

/**
 * Type guard to check if a string is not empty
 */
export function isNotEmpty(value: string | null | undefined): value is string {
  return isDefined(value) && value.trim().length > 0;
}

/**
 * Type guard to check if an array has elements
 */
export function hasElements<T>(array: T[] | null | undefined): array is T[] {
  return isDefined(array) && array.length > 0;
}

/**
 * Safe number parsing that returns undefined for invalid numbers
 */
export function safeParseInt(value: string | number | null | undefined): number | undefined {
  if (!isDefined(value)) return undefined;
  
  const parsed = typeof value === 'string' ? parseInt(value, 10) : value;
  return isNaN(parsed) ? undefined : parsed;
}

/**
 * Safe number parsing that returns undefined for invalid numbers
 */
export function safeParseFloat(value: string | number | null | undefined): number | undefined {
  if (!isDefined(value)) return undefined;
  
  const parsed = typeof value === 'string' ? parseFloat(value) : value;
  return isNaN(parsed) ? undefined : parsed;
}