export function orUndefined<T>(value: T): NonNullable<T> | undefined {
  return value || undefined;
}
