import {
  MobileStudentSettingsTabId,
  StudentSettingsTabId,
} from "@litespace/utils/routes";
import { MemoExoticComponent, SVGProps } from "react";

export type Tab = {
  id: StudentSettingsTabId | MobileStudentSettingsTabId;
  Icon?: MemoExoticComponent<(props: SVGProps<SVGSVGElement>) => JSX.Element>;
  label: string;
  important?: boolean;
};
