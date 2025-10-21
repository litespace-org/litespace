import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { TabsV2 } from "@litespace/ui/Tabs";
import React, { useMemo } from "react";

import NotificationSettings from "@/components/Settings/NotificationSettings";
import PersonalDetails from "@/components/Settings/PersonalDetails";
import { PublicInfo } from "@/components/Settings/PublicInfo";
import RefundsList from "@/components/Settings/RefundsList";
import UpdatePassword from "@/components/Settings/UpdatePassword";
import { isPersonalInfoIncomplete } from "@/components/Settings/utils";
import MobileSettingsPages from "@/components/StudentSettings/MobileSettingsPages";
import RefundsTable from "@/components/StudentSettings/RefundsTable";
import { ITab, Tab } from "@/components/StudentSettings/types";
import Categories from "@litespace/assets/Categories";
import Lock from "@litespace/assets/Lock";
import Notification from "@litespace/assets/Notification";
import ProfileAvatar from "@litespace/assets/ProfileAvatar";
import RightArrowHead from "@litespace/assets/RightArrowHead";
import Wallet from "@litespace/assets/Wallet";
import { useMediaQuery } from "@litespace/headless/mediaQuery";
import { IUser } from "@litespace/types";
import { Button } from "@litespace/ui/Button";
import { Typography } from "@litespace/ui/Typography";
import cn from "classnames";

const Content: React.FC<{
  tab: ITab;
  setTab: (tab: ITab) => void;
  user: IUser.Self;
}> = ({ tab, setTab, user }) => {
  const intl = useFormatMessage();
  const mq = useMediaQuery();
  const tabs: Tab[] = useMemo(() => {
    return [
      { id: "settings", label: intl("student-settings.profile.title") },
      {
        id: "personal",
        Icon: ProfileAvatar,
        label: intl("shared-settings.personal.title"),
        important: isPersonalInfoIncomplete(user),
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
        id: "public-info",
        Icon: Categories,
        label: intl("student-settings.public-info"),
        important: false,
      },
      {
        id: "refunds",
        Icon: Wallet,
        label: intl("student-settings.refunds.title"),
        important: false,
      },
    ];
  }, [intl, user]);

  return (
    <div className="grow flex flex-col">
      <div className="flex md:hidden gap-2 items-center mb-6">
        <Button
          variant="secondary"
          className={cn("!bg-transparent !border-none !ps-0", {
            hidden: tab === "settings",
          })}
          startIcon={
            <RightArrowHead className="icon w-6 h-6 [&>*]:stroke-[#292D32] -my-1" />
          }
          onClick={() => setTab("settings")}
        />
        <Typography tag="h3" className="text-body font-bold">
          {tabs.find((t) => t?.id === tab)?.label}
        </Typography>
      </div>

      <div className="hidden md:block max-w-[450px] md:max-w-fit mb-6 lg:mb-10">
        <TabsV2 tabs={tabs.slice(1)} tab={tab} setTab={setTab} />
      </div>

      {tab === "settings" ? (
        <MobileSettingsPages user={user} tabs={tabs} setTab={setTab} />
      ) : null}

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
          verifiedPhone={user.verifiedPhone}
          notificationMethod={user.notificationMethod}
        />
      ) : null}

      {tab === "public-info" ? (
        <div className="max-w-[530px] grow flex">
          <PublicInfo />
        </div>
      ) : null}

      {mq.md && tab === "refunds" ? <RefundsTable /> : null}
      {!mq.md && tab === "refunds" ? <RefundsList /> : null}
    </div>
  );
};

export default Content;
