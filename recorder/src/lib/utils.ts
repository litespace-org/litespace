import zod from "zod";

export function number(value: unknown): number {
  return zod.coerce.number().parse(value);
}

export function omitByIdex<T>(values: T[], target: number): T[] {
  return values.filter((_, idx) => idx !== target);
}

// eslint-disable-next-line @typescript-eslint/ban-types
export function nameof<T extends Function>(f: T): string {
  return f.name;
}
