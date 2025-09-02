import { Typography } from "@litespace/ui/Typography";
import { Switch } from "@litespace/ui/Switch";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { useState } from "react";

const UnverifiedPhoneFragment = () => {
  const intl = useFormatMessage();
  const [enabled, setEnabled] = useState(false);
  return (
    <div className="flex flex-col gap-4">
      <Typography tag="h2" className="text-natural-950 font-bold">
        {intl("shared-settings.notification.title")}
      </Typography>
      <div className="flex items-start gap-20">
        <div className="flex flex-col gap-1">
          <Typography
            tag="p"
            className="text-natural-950 text-base font-normal"
          >
            {intl("shared-settings.notification.description-1")}
          </Typography>
          <Typography
            tag="p"
            className="text-natural-950 text-base font-normal"
          >
            {intl("shared-settings.notification.description-2")}
          </Typography>
        </div>
        <Switch size="large" checked={enabled} onChange={setEnabled} />
      </div>
    </div>
  );
};

export default UnverifiedPhoneFragment;
