import { ITutor, IUser } from "@litespace/types";
import React, { useMemo } from "react";
import { Tab, TabId } from "@/components/TutorSettings/types";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Tabs } from "@litespace/ui/Tabs";
import PersonalDetailsForm from "@/components/Settings/PersonalDetails";
import UpdatePassword from "@/components/Settings/UpdatePassword";
import NotificationSettings from "@/components/Settings/NotificationSettings";
import { isPersonalInfoIncomplete } from "@/components/Settings/utils";

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
    ],
    [intl, user]
  );

  const tabComponents: Record<TabId, React.JSX.Element> = useMemo(
    () => ({
      personal: (
        <PersonalDetailsForm
          forStudent={false}
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
      ),
      password: <UpdatePassword id={user.id} />,
      notifications: (
        <NotificationSettings
          id={user.id}
          phone={user.phone}
          verifiedWhatsApp={user.verifiedWhatsApp}
          verifiedTelegram={user.verifiedTelegram}
          notificationMethod={user.notificationMethod}
        />
      ),
    }),
    [
      user.city,
      user.email,
      user.name,
      user.gender,
      user.phone,
      user.verifiedEmail,
      user.verifiedPhone,
      user.verifiedTelegram,
      user.verifiedWhatsApp,
      user.image,
      user.id,
      user.notificationMethod,
    ]
  );

  return (
    <div>
      <div className="max-w-[538px] mb-10">
        <Tabs tabs={tabs} tab={tab} setTab={setTab} />
      </div>

      {tabComponents[tab]}
    </div>
  );
};

export default AccountSettings;
