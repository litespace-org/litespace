import { SVGProps } from "react";
import { Web, Landing, Dashboard } from "@litespace/utils/routes";
import { Icon as ReactFeatherIcon } from "react-feather";

export type LinkInfo = {
  label: string;
  route: Web | Landing | Dashboard;
  isActive: boolean;
  Icon?: Icon;
  tail?: React.ReactNode;
};

export type Icon =
  | React.MemoExoticComponent<(props: SVGProps<SVGSVGElement>) => JSX.Element>
  | ReactFeatherIcon;
