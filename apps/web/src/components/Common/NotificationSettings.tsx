import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { FullSwitch } from "@litespace/ui/Switch";
import { useToast } from "@litespace/ui/Toast";
import { Typography } from "@litespace/ui/Typography";
import { useCallback } from "react";

const NotificationSettings = () => {
  const intl = useFormatMessage();
  const toast = useToast();

  const notifyComingSoon = useCallback(() => {
    toast.success({
      title: intl("settings.notifications.coming-soon.title"),
      description: intl("settings.notifications.coming-soon.description"),
    });
  }, [intl, toast]);

  return (
    <>
      <Typography
        element="subtitle-1"
        weight="bold"
        className="text-natural-950 mt-6"
      >
        {intl("tutor-settings.account-settings.notifications.title")}
      </Typography>
      <div className="flex flex-col gap-4 mt-6 max-w-[467px]">
        <FullSwitch
          title={intl("settings.notifications.lesson-date.title")}
          description={intl("settings.notifications.lesson-date.description")}
          checked={false}
          disabled={false}
          onChange={notifyComingSoon}
        />
        <FullSwitch
          title={intl("settings.notifications.messages.title")}
          description={intl("settings.notifications.messages.description")}
          checked={false}
          disabled={false}
          onChange={notifyComingSoon}
        />
      </div>
    </>
  );
};

export default NotificationSettings;
