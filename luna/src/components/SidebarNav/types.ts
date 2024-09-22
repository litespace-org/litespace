import { Void } from "@litespace/types";

export type NavOption = {
  label: string;
  route: string;
  onClick?: Void;
  loading?: boolean;
  disabled?: boolean;
};
