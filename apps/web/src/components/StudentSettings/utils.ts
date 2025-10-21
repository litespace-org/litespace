import { StudentSettingsTabId } from "@litespace/utils/routes";

export function isValidTab(tab: string): tab is StudentSettingsTabId {
  return [
    "personal",
    "password",
    "notifications",
    "public-info",
    "refunds",
  ].includes(tab);
}
