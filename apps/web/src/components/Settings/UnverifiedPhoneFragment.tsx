import { Typography } from "@litespace/ui/Typography";
import { Switch } from "@litespace/ui/Switch";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { useState } from "react";
import { Button } from "@litespace/ui/Button";
import { IUser } from "@litespace/types";

const UnverifiedPhoneFragment: React.FC<{
  notificationMethod: IUser.NotificationMethod | null;
  save: (notificationsEnabled: boolean) => void;
}> = ({ notificationMethod, save }) => {
  const intl = useFormatMessage();
  const [enabled, setEnabled] = useState<boolean>(!!notificationMethod);

  return (
    <div className="flex flex-col gap-4">
      {/* <Typography tag="h2" className="text-natural-950 font-bold">
        {intl("shared-settings.notification.title")}
      </Typography> */}
      <div className="flex items-end gap-[21px]">
        <div className="flex flex-col gap-1">
          <Typography
            tag="p"
            className="text-natural-950 text-base font-normal"
          >
            {intl("shared-settings.notification.description")}
          </Typography>
        </div>
        <Switch size="small" checked={enabled} onChange={setEnabled} />
      </div>
      <Button
        size="large"
        onClick={() => save(enabled)}
        disabled={enabled === !!notificationMethod}
      >
        <Typography tag="span" className="text-body font-medium">
          {intl("shared-settings.save")}
        </Typography>
      </Button>
    </div>
  );
};

export default UnverifiedPhoneFragment;
