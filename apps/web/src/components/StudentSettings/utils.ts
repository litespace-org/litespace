import { StudentSettingsTabId } from "@litespace/utils/routes";

export function isValidTab(tab: string): tab is StudentSettingsTabId {
  return ["personal", "public-info", "password", "notifications"].includes(tab);
}
