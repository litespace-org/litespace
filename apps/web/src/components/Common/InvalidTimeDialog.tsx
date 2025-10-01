import { ConfirmationDialog } from "@litespace/ui/ConfirmationDialog";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { useCheckTimeValidity } from "@/hooks/time";
import { LITESPACE_SUPPORT_URL } from "@litespace/utils";
import { Clock } from "react-feather";

export function InvalidTimeDialog() {
  const intl = useFormatMessage();
  const timeValid = useCheckTimeValidity();

  return (
    <ConfirmationDialog
      open={!timeValid}
      type="error"
      title={intl("invalid-time-dialog.title")}
      description={intl("invalid-time-dialog.description")}
      actions={{
        primary: {
          label: intl("labels.contact-us"),
          onClick: () => window.location.replace(LITESPACE_SUPPORT_URL),
        },
      }}
      icon={<Clock />}
    />
  );
}
