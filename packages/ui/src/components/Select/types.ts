import { Void } from "@litespace/types";

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
  /**
   * if `true`, the select component will act as a button and the menu will not
   * be shown.
   */
  asButton?: boolean;
  disabled?: boolean;
  state?: "error" | "success";
  helper?: string;
  onChange?: (value: T) => void;
  onOpenChange?: (open: boolean) => void;
  onTriggerClick?: Void;
};

export type SelectList<T extends string | number> = Array<{
  disabled?: boolean;
  label: string;
  value: T;
}>;

export type SelectPlacement = "top" | "bottom";

export type SelectSize = "small" | "medium" | "large";
