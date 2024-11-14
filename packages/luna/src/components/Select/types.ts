export type SelectList<T extends string | number | boolean | undefined> =
  Array<{
    label: string;
    value: T;
  }>;

export type SelectPlacement = "top" | "bottom";
