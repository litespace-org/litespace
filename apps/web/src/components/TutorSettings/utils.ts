import { TabId } from "@/components/TutorSettings/types";

export function isValidTab(tab: string): tab is TabId {
  return ["personal", "password", "notifications", "topics"].includes(tab);
}
