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
