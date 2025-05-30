import { StudentSettingsTabId } from "@litespace/utils/routes";

export type Tab = {
  id: StudentSettingsTabId;
  label: string;
  important?: boolean;
};
