import { StudentSettingsTabId } from "@litespace/utils/routes";
import { MemoExoticComponent, SVGProps } from "react";

export type Tab = {
  id: ITab;
  Icon?: MemoExoticComponent<(props: SVGProps<SVGSVGElement>) => JSX.Element>;
  label: string;
  important?: boolean;
};

export type MobileSettings = StudentSettingsTabId | "settings";

export type ITab = StudentSettingsTabId | MobileSettings;
