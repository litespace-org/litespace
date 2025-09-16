import { useFormatMessage } from "@litespace/ui/hooks/intl";
import React, { useMemo } from "react";
import { TabsV2 } from "@litespace/ui/Tabs";

import NotificationSettings from "@/components/Settings/NotificationSettings";
import UpdatePassword from "@/components/Settings/UpdatePassword";
import PersonalDetails from "@/components/Settings/PersonalDetails";
import UploadPhoto from "@/components/StudentSettings/UploadPhoto";
import { IUser } from "@litespace/types";
import { Tab } from "@/components/StudentSettings/types";
import { isPersonalInfoIncomplete } from "@/components/Settings/utils";
import { StudentSettingsTabId } from "@litespace/utils/routes";
import RefundsList from "@/components/Settings/RefundsList";
import RefundsTable from "@/components/StudentSettings/RefundsTable";
import { useMediaQuery } from "@litespace/headless/mediaQuery";
import ProfileAvatar from "@litespace/assets/ProfileAvatar";
import { Lock, Paperclip, DollarSign } from "react-feather";
import Notification from "@litespace/assets/Notification";
import StudentPublicInfo from "@/components/Settings/StudentPublicInfo";

const Content: React.FC<{
  tab: StudentSettingsTabId;
  setTab: (tab: StudentSettingsTabId) => void;
  user: IUser.Self;
}> = ({ tab, setTab, user }) => {
  const intl = useFormatMessage();
  const mq = useMediaQuery();
  const tabs: Tab[] = useMemo(() => {
    return [
      {
        id: "personal",
        Icon: ProfileAvatar,
        label: intl("shared-settings.personal.title"),
        important: isPersonalInfoIncomplete(user),
      },
      {
        id: "public-info",
        label: intl("student-settings.public-info.title"),
        important: false,
      },
      {
        id: "password",
        Icon: Lock,
        label: intl("shared-settings.password.title"),
        important: !user.password,
      },
      {
        id: "notifications",
        Icon: Notification,
        label: intl("shared-settings.notification.title"),
        important: !user.notificationMethod,
      },
      {
        id: "topics",
        Icon: Paperclip,
        label: intl("student-settings.topics.title"),
        important: false,
      },
      {
        id: "refunds",
        Icon: DollarSign,
        label: intl("student-settings.refunds.title"),
        important: false,
      },
    ];
  }, [intl, user]);

  return (
    <div className="grow flex flex-col">
      <div className="mb-6 md:hidden">
        <UploadPhoto id={user.id} name={user.name} image={user.image} />
      </div>

      <div className="max-w-[450px] md:max-w-fit mb-6 lg:mb-10">
        <TabsV2 tabs={tabs} tab={tab} setTab={setTab} />
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

      {tab === "public-info" ? (
        <div className="max-w-[530px] grow flex">
          <StudentPublicInfo id={user.id} />
        </div>
      ) : null}

      {tab === "password" ? <UpdatePassword id={user.id} /> : null}

      {tab === "notifications" ? (
        <NotificationSettings
          id={user.id}
          phone={user.phone}
          verifiedWhatsApp={user.verifiedWhatsApp}
          verifiedPhone={user.verifiedPhone}
          notificationMethod={user.notificationMethod}
        />
      ) : null}
<<<<<<< HEAD

      {tab === "topics" ? (
        <div className="max-w-[530px] grow flex">
          <TopicSelection />
        </div>
      ) : null}

      {mq.md && tab === "refunds" ? <RefundsTable /> : null}
      {!mq.md && tab === "refunds" ? <RefundsList /> : null}
=======
>>>>>>> e99ae026 (update(web): update student settings page design)
    </div>
  );
};

export default Content;
