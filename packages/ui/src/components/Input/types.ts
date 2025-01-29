export type InputType = "password" | "text";

export type InputAction = {
  id: number;
  Icon: React.FC<{ className?: string }>;
  onClick?: () => void;
  className?: string;
};
