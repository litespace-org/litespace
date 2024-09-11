export type SelectList<T extends string | number> = Array<{
  label: string;
  value: T;
}>;

export type SelectPlacement = "top" | "bottom";
