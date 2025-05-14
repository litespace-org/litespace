import { ITutor, IUser } from "@litespace/types";
import React, { useMemo } from "react";
import { Tab, TabId } from "@/components/TutorSettings/types";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Tabs } from "@litespace/ui/Tabs";
import PersonalDetailsForm from "@/components/Settings/PersonalDetails";
import UpdatePassword from "@/components/Settings/UpdatePassword";
import NotificationSettings from "@/components/Settings/NotificationSettings";

type Props = {
  user: IUser.Self & ITutor.FindTutorMetaApiResponse;
  tab: TabId;
  setTab: (tab: TabId) => void;
};

const AccountSettings: React.FC<Props> = ({ user, setTab, tab }) => {
  const intl = useFormatMessage();
  const tabs: Tab[] = useMemo(
    () => [
      {
        id: "personal",
        label: intl("tutor-settings.personal.title"),
        important:
          !user.email ||
          !user.phone ||
          !user.city ||
          !user.gender ||
          !user.verifiedEmail ||
          !user.verifiedPhone ||
          !user.notice ||
          !user.studioId,
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
    ],
    [
      intl,
      user.city,
      user.email,
      user.gender,
      user.notificationMethod,
      user.password,
      user.phone,
      user.verifiedEmail,
      user.verifiedPhone,
      user.notice,
      user.studioId,
    ]
  );

  return (
    <div>
      <div className="max-w-[538px] mb-10">
        <Tabs tabs={tabs} tab={tab} setTab={setTab} />
      </div>

      {tab === "personal" ? (
        <PersonalDetailsForm
          forStudent={false}
          image={user.image}
          name={user.name}
          id={user.id}
          email={user.email}
          city={user.city}
          gender={user.gender}
          phone={user.phone}
          notice={user.notice}
          studio={user.studioId}
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
    </div>
  );
};

export default AccountSettings;
