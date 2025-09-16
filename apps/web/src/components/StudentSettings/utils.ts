import {
  MobileStudentSettingsTabId,
  StudentSettingsTabId,
} from "@litespace/utils/routes";

export function isValidTab(tab: string): tab is StudentSettingsTabId {
  return [
    "personal",
    "password",
    "notifications",
    "public-info",
    "refunds",
  ].includes(tab);
}

export function isValidMobileTab(
  tab: string
): tab is MobileStudentSettingsTabId {
  return [
    "settings",
    "personal",
    "password",
    "notifications",
    "public-info",
    "refunds",
  ].includes(tab);
}
