import { Void } from "@litespace/types";
import { Icon } from "react-feather";

export type NavOption = {
  label: string;
  route: string;
  icon: Icon;
  onClick?: Void;
  loading?: boolean;
  disabled?: boolean;
};

export type NavAccordionItem = {
  id: number | string;
  title: string;
  childRoutes: NavOption[];
};
