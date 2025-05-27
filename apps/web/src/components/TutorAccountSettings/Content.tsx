import { IUser } from "@litespace/types";
import React, { useMemo } from "react";
import { Tab, TabId } from "@/components/TutorAccountSettings/types";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Tabs } from "@litespace/ui/Tabs";
import PersonalDetails from "@/components/Settings/PersonalDetails";
import UpdatePassword from "@/components/Settings/UpdatePassword";
import NotificationSettings from "@/components/Settings/NotificationSettings";
import { isPersonalInfoIncomplete } from "@/components/Settings/utils";

type Props = {
  notice: number;
  user: IUser.Self;
  tab: TabId;
  setTab: (tab: TabId) => void;
};

const Content: React.FC<Props> = ({ notice, user, setTab, tab }) => {
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

  return (
    <div>
      <div className="w-fit mb-10">
        <Tabs tabs={tabs} tab={tab} setTab={setTab} />
      </div>

      <Body tab={tab} user={user} notice={notice} />
    </div>
  );
};

const Body: React.FC<{ tab: TabId; user: IUser.Self; notice: number }> = ({
  tab,
  user,
  notice,
}) => {
  if (tab === "personal")
    return (
      <PersonalDetails
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
        notice={notice}
      />
    );
  if (tab === "password") return <UpdatePassword id={user.id} />;

  if (tab === "notifications")
    return (
      <NotificationSettings
        id={user.id}
        phone={user.phone}
        verifiedWhatsApp={user.verifiedWhatsApp}
        verifiedTelegram={user.verifiedTelegram}
        notificationMethod={user.notificationMethod}
      />
    );

  throw new Error("unexpected tab");
};

export default Content;
