import { ConfirmationDialog } from "@litespace/ui/ConfirmationDialog";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import Switch from "@litespace/assets/Switch";
import { useCallback, useState } from "react";

const CHROME_LINK = "https://www.google.com/chrome/";
const WEBRTC_UNSUPPORTED = typeof RTCPeerConnection === "undefined";

export function WebrtcCheckDialog() {
  const intl = useFormatMessage();
  const [showDialog, setShowDialog] = useState(WEBRTC_UNSUPPORTED);
  const close = useCallback(() => {
    setShowDialog(false);
  }, []);

  return (
    <ConfirmationDialog
      open={showDialog}
      type="warning"
      title={intl("webrtc-check.title")}
      description={intl("webrtc-check.description")}
      close={close}
      actions={{
        primary: {
          label: intl("webrtc-check.confirm"),
          onClick: () => {
            location.href = CHROME_LINK;
            close();
          },
        },
        secondary: {
          label: intl("labels.cancel"),
          onClick: close,
        },
      }}
      icon={<Switch />}
    />
  );
}
