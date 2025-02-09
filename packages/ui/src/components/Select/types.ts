export type SelectProps<T extends string | number> = {
  title?: string;
  placeholder?: string;
  options?: SelectList<T>;
  value?: T;
  size?: SelectSize;
  placement?: SelectPlacement;
  children?: React.ReactNode;
  showDropdownIcon?: boolean;
  disabled?: boolean;
  helper?: string;
  onChange?: (value: T) => void;
};

export type SelectList<T extends string | number> = Array<{
  label: string;
  value: T;
}>;

export type SelectPlacement = "top" | "bottom";

export type SelectSize = "small" | "medium" | "large";
