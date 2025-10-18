import { StudentSettingsTabId } from "@litespace/utils/routes";
import { MemoExoticComponent, SVGProps } from "react";

export type Tab = {
  id: StudentSettingsTabId;
  icon?: MemoExoticComponent<(props: SVGProps<SVGSVGElement>) => JSX.Element>;
  label: string;
  important?: boolean;
};
