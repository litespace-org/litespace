export type InputType = "password" | "text";

export type InputAction = {
  id: number;
  icon: React.ReactNode;
  onClick?: () => void;
  className?: string;
};

export type InputSize = "small" | "medium" | "large";
