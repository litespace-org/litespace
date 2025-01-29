export function withDevLog<T extends object>(value: T): T {
  if (!import.meta.env.PROD) console.log(JSON.stringify(value, null, 2));
  return value;
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export function nameof<T extends Function>(f: T): string {
  return f.name;
}
