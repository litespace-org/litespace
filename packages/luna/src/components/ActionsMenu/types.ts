export type MenuAction = {
  id: number;
  label: string;
  disabled?: boolean;
  danger?: boolean;
  onClick?: () => void;
};
