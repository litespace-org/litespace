export enum InputType {
  Password = "password",
  Text = "text",
  Date = "date",
}

export type InputAction = {
  id: number;
  Icon: React.FC<{ className?: string }>;
  onClick: () => void;
};
