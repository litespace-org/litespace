export type ITutorSettingsForm = {
  name: string;
  bio: string;
  about: string;
};

export type TabId = "personal" | "password" | "notifications";

export type Tab = {
  id: TabId;
  label: string;
  important?: boolean;
};

export function isValidTab(tab: string): tab is TabId {
  return ["personal", "password", "notifications", "topics"].includes(tab);
}
