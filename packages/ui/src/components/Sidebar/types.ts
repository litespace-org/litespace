import { SVGProps } from "react";
import { Web, Landing, Dashboard } from "@litespace/utils/routes";

export type LinkInfo = {
  label: string;
  route: Web | Landing | Dashboard;
  Icon: Icon;
  isActive: boolean;
  tail?: React.ReactNode;
};

export type Icon = React.MemoExoticComponent<
  (props: SVGProps<SVGSVGElement>) => JSX.Element
>;
