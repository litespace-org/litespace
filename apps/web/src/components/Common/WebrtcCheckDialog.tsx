import { ConfirmationDialog } from "@litespace/ui/ConfirmationDialog";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import WebrtcCheck from "@litespace/assets/WebrtcCheck";
import { useCallback, useState } from "react";

const CHROME_LINK = "https://www.google.com/chrome/";

export function WebrtcCheckDialog() {
  const intl = useFormatMessage();
  const [showDialog, setShowDialog] = useState(
    typeof RTCPeerConnection === "undefined"
  );

  const closeDialog = useCallback(() => setShowDialog(false), []);
  const goToChrome = useCallback(() => {
    location.href = CHROME_LINK;
  }, []);

  return (
    <ConfirmationDialog
      open={showDialog}
      type="warning"
      title={intl("webrtc-check.title")}
      description={intl("webrtc-check.description")}
      actions={{
        primary: {
          label: intl("webrtc-check.confirm"),
          onClick: goToChrome,
        },
        secondary: {
          label: intl("labels.cancel"),
          onClick: closeDialog,
        },
      }}
      icon={<WebrtcCheck />}
    />
  );
}
