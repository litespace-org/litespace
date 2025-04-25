export type SelectProps<T extends string | number> = {
  id?: string;
  className?: string;
  label?: string;
  placeholder?: string;
  options?: SelectList<T>;
  value?: T;
  size?: SelectSize;
  placement?: SelectPlacement;
  children?: React.ReactNode;
  showDropdownIcon?: boolean;
  disabled?: boolean;
  state?: "error" | "success";
  helper?: string;
  onChange?: (value: T) => void;
  onOpenChange?: (open: boolean) => void;
};

export type SelectList<T extends string | number> = Array<{
  disabled?: boolean;
  label: string;
  value: T;
}>;

export type SelectPlacement = "top" | "bottom";

export type SelectSize = "small" | "medium" | "large";
