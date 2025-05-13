export type TabId = "personal" | "password" | "notifications" | "topics";

export type Tab = {
  id: TabId;
  label: string;
  important?: boolean;
};
