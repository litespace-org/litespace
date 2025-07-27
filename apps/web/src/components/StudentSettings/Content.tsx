import { useFormatMessage } from "@litespace/ui/hooks/intl";
import React, { useMemo } from "react";
import { Tabs } from "@litespace/ui/Tabs";

import NotificationSettings from "@/components/Settings/NotificationSettings";
import UpdatePassword from "@/components/Settings/UpdatePassword";
import PersonalDetails from "@/components/Settings/PersonalDetails";
import TopicSelection from "@/components/Settings/TopicSelection";
import UploadPhoto from "@/components/StudentSettings/UploadPhoto";
import { IUser } from "@litespace/types";
import { Tab } from "@/components/StudentSettings/types";
import { isPersonalInfoIncomplete } from "@/components/Settings/utils";
import { StudentSettingsTabId } from "@litespace/utils/routes";

const Content: React.FC<{
  tab: StudentSettingsTabId;
  setTab: (tab: StudentSettingsTabId) => void;
  user: IUser.Self;
}> = ({ tab, setTab, user }) => {
  const intl = useFormatMessage();

  const tabs: Tab[] = useMemo(() => {
    return [
      {
        id: "personal",
        label: intl("shared-settings.personal.title"),
        important: isPersonalInfoIncomplete(user),
      },
      {
        id: "password",
        label: intl("shared-settings.password.title"),
        important: !user.password,
      },
      {
        id: "notifications",
        label: intl("shared-settings.notification.title"),
        important: !user.notificationMethod,
      },
      {
        id: "topics",
        label: intl("student-settings.topics.title"),
        important: false,
      },
    ];
  }, [intl, user]);

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
          forStudent
          id={user.id}
          image={user.image}
          email={user.email}
          name={user.name}
          city={user.city}
          gender={user.gender}
          phone={user.phone}
          verifiedEmail={user.verifiedEmail}
          verifiedPhone={user.verifiedPhone}
          notice={0}
        />
      ) : null}

      {tab === "password" ? <UpdatePassword id={user.id} /> : null}

      {tab === "notifications" ? (
        <NotificationSettings
          id={user.id}
          phone={user.phone}
          verifiedWhatsApp={user.verifiedWhatsApp}
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
