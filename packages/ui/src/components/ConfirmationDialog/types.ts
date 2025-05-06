import { Void } from "@litespace/types";

export type DialogType = "main" | "success" | "warning" | "error";

export type Action = {
  label: string;
  onClick?: Void;
  loading?: boolean;
  disabled?: boolean;
};
