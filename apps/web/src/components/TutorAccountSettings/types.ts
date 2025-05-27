export type TabId = "personal" | "password" | "notifications";

export type Tab = {
  id: TabId;
  label: string;
  important?: boolean;
};
