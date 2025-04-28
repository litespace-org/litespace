import { TabId } from "@/components/StudentSettings/V2/types";

export function isValidTab(tab: string): tab is TabId {
  return ["personal", "password", "notifications", "topics"].includes(tab);
}
