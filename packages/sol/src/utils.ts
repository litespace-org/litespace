export function orUndefined<T>(value: T): NonNullable<T> | undefined {
  return value || undefined;
}

// eslint-disable-next-line @typescript-eslint/ban-types
export function nameof<T extends Function>(f: T): string {
  return f.name;
}
