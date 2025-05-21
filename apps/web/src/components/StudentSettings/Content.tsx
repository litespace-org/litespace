import { useFormatMessage } from "@litespace/ui/hooks/intl";
import React, { useMemo } from "react";
import { Tabs } from "@litespace/ui/Tabs";
import { NotificationSettings } from "@/components/StudentSettings/NotificationSettings";
import { UpdatePassword } from "@/components/StudentSettings/UpdatePassword";
import { PersonalDetails } from "@/components/StudentSettings/PersonalDetails";
import TopicSelection from "@/components/StudentSettings/TopicSelection";
import { IUser } from "@litespace/types";
import { Tab, TabId } from "@/components/StudentSettings/types";
import UploadPhoto from "@/components/StudentSettings/UploadPhoto";

const Content: React.FC<{
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
    <div className="grow flex flex-col">
      <div className="mb-6 md:hidden">
        <UploadPhoto id={user.id} name={user.name} image={user.image} />
      </div>

      <div className="md:max-w-fit mb-6 lg:mb-10">
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
        <div className="max-w-[530px] grow flex">
          <TopicSelection />
        </div>
      ) : null}
    </div>
  );
};

export default Content;
