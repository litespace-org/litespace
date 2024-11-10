export type MenuAction = {
  id: number | string;
  label: string;
  disabled?: boolean;
  danger?: boolean;
  onClick?: () => void;
  subActions?: MenuAction[];
  checked?: boolean;
  radioGroup?: Array<{ id: number; label: string; value: string }>;
  value?: string;
  onRadioValueChange?: (value: string) => void;
};
