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
      title: intl("shared-settings.notifications.coming-soon.title"),
      description: intl(
        "shared-settings.notifications.coming-soon.description"
      ),
    });
  }, [intl, toast]);

  return (
    <div className="w-full">
      <Typography
        tag="h1"
        className="text-natural-950 text-subtitle-2 md:text-body lg:text-subtitle-1 font-bold"
      >
        {intl("tutor-settings.account-settings.notifications.title")}
      </Typography>
      <div className="flex flex-col gap-2 md:gap-4 mt-4 lg:mt-6">
        <FullSwitch
          title={intl("shared-settings.notifications.lesson-date.title")}
          description={intl(
            "shared-settings.notifications.lesson-date.description"
          )}
          checked={false}
          disabled={false}
          onChange={notifyComingSoon}
        />
        <FullSwitch
          title={intl("shared-settings.notifications.messages.title")}
          description={intl(
            "shared-settings.notifications.messages.description"
          )}
          checked={false}
          disabled={false}
          onChange={notifyComingSoon}
        />
      </div>
    </div>
  );
};

export default NotificationSettings;
