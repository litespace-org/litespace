import PageTitle from "@/components/Common/PageTitle";
import { NotificationSettings } from "@/components/StudentSettings/V2/NotificationSettings";
import { PasswordForm } from "@/components/StudentSettings/V2/PasswordForm";
import PersonalDetailsForm from "@/components/StudentSettings/V2/PersonalDetailsForm";
import TopicSelection from "@/components/StudentSettings/V2/TopicSelection";
import { useCurrentUser } from "@litespace/headless/user";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Tabs } from "@litespace/ui/Tabs";
import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";

type TabId = "personal" | "password" | "notifications" | "topics";
type Tab = {
  id: TabId;
  label: string;
  important?: boolean;
};

function isValidTab(tab: string): tab is TabId {
  return ["personal", "password", "notifications", "topics"].includes(tab);
}

export default function StudentSettingsV2() {
  const intl = useFormatMessage();
  const [params, setParams] = useSearchParams();

  const activeTab: TabId = useMemo(() => {
    const tab = params.get("tab");
    if (!tab || !isValidTab(tab)) return "personal";
    return tab;
  }, [params]);

  const changeTab = (tab: TabId) => {
    setParams({ tab: tab });
  };

  const tabs: Tab[] = useMemo(
    () => [
      {
        id: "personal",
        label: intl("student-settings.personal.title"),
        important: false,
      },
      {
        id: "password",
        label: intl("student-settings.password.title"),
        important: false,
      },
      {
        id: "notifications",
        label: intl("student-settings.notification.title"),
        important: false,
      },
      {
        id: "topics",
        label: intl("student-settings.topics.title"),
        important: false,
      },
    ],
    [intl]
  );

  const userDetails = useCurrentUser();

  if (!userDetails.query.data) return null;

  return (
    <div className="p-6">
      <PageTitle
        title={intl("student-settings.profile.title")}
        className="mb-4 md:mb-6"
        fetching={userDetails.query.isPending}
      />
      <div className="max-w-[538px] mb-10">
        <Tabs tabs={tabs} tab={activeTab} setTab={changeTab} />
      </div>
      {activeTab === "personal" ? (
        <PersonalDetailsForm
          image={userDetails.query.data.image}
          id={userDetails.query.data.id}
          personalDetails={userDetails.query.data}
        />
      ) : null}

      {activeTab === "password" ? (
        <PasswordForm id={userDetails.query.data.id} />
      ) : null}

      {activeTab === "notifications" ? (
        <NotificationSettings
          notificationMethod={userDetails.query.data.notificationMethod}
          id={userDetails.query.data.id}
        />
      ) : null}

      {activeTab === "topics" ? (
        <div className="max-w-[531px]">
          <TopicSelection />
        </div>
      ) : null}
    </div>
  );
}
