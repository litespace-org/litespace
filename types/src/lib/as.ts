export const as = {
  any: <T>(value: T): any => value,
  casted: <T>(value: unknown) => value as T,
  int: (value: string | number): number => Number(value),
};
