import { TabId } from "@/components/StudentSettings/types";

export function isValidTab(tab: string): tab is TabId {
  return ["personal", "password", "notifications", "topics"].includes(tab);
}
