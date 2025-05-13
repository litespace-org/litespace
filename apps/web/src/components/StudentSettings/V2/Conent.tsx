import { useFormatMessage } from "@litespace/ui/hooks/intl";
import React, { useMemo } from "react";
import { Tabs } from "@litespace/ui/Tabs";
import { NotificationSettings } from "@/components/StudentSettings/V2/NotificationSettings";
import { UpdatePassword } from "@/components/StudentSettings/V2/UpdatePassword";
import { PersonalDetails } from "@/components/StudentSettings/V2/PersonalDetails";
import TopicSelection from "@/components/StudentSettings/V2/TopicSelection";
import { IUser } from "@litespace/types";
import { Tab, TabId } from "@/components/StudentSettings/V2/types";

const Conent: React.FC<{
  tab: TabId;
  setTab: (tab: TabId) => void;
  user: IUser.Self;
}> = ({ tab, setTab, user }) => {
  const intl = useFormatMessage();
  const tabs: Tab[] = useMemo(
    () => [
      {
        id: "personal",
        label: intl("student-settings.personal.title"),
        important:
          !user.name ||
          !user.email ||
          !user.phone ||
          !user.city ||
          !user.gender ||
          !user.image ||
          !user.verifiedEmail ||
          !user.verifiedPhone,
      },
      {
        id: "password",
        label: intl("student-settings.password.title"),
        important: !user.password,
      },
      {
        id: "notifications",
        label: intl("student-settings.notification.title"),
        important: !user.notificationMethod,
      },
      {
        id: "topics",
        label: intl("student-settings.topics.title"),
        important: false,
      },
    ],
    [
      intl,
      user.city,
      user.email,
      user.gender,
      user.image,
      user.name,
      user.notificationMethod,
      user.password,
      user.phone,
      user.verifiedEmail,
      user.verifiedPhone,
    ]
  );

  return (
    <div>
      <div className="max-w-[538px] mb-10">
        <Tabs tabs={tabs} tab={tab} setTab={setTab} />
      </div>

      {tab === "personal" ? (
        <PersonalDetails
          id={user.id}
          image={user.image}
          email={user.email}
          name={user.name}
          city={user.city}
          gender={user.gender}
          phone={user.phone}
          verifiedEmail={user.verifiedEmail}
          verifiedPhone={user.verifiedPhone}
        />
      ) : null}

      {tab === "password" ? <UpdatePassword id={user.id} /> : null}

      {tab === "notifications" ? (
        <NotificationSettings
          id={user.id}
          phone={user.phone}
          verifiedWhatsApp={user.verifiedWhatsApp}
          verifiedTelegram={user.verifiedTelegram}
          notificationMethod={user.notificationMethod}
        />
      ) : null}

      {tab === "topics" ? (
        <div className="max-w-[531px]">
          <TopicSelection />
        </div>
      ) : null}
    </div>
  );
};

export default Conent;
