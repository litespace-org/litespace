import { ConfirmationDialog } from "@litespace/ui/ConfirmationDialog";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import Switch from "@litespace/assets/Switch";
import { useMemo } from "react";

const CHROME_LINK = "https://www.google.com/chrome/";

export function UnsupportedBrowserDialog() {
  const intl = useFormatMessage();

  const unsupportedBrowser = useMemo<boolean>(() => {
    const keywords = [/messenger/i, /facebook/i, /FB/, /FB_IAB/];
    if (!navigator.userAgent) return true;
    for (const word of keywords)
      if (navigator.userAgent.search(word) !== -1) return true;
    return false;
  }, []);

  return (
    <ConfirmationDialog
      open={unsupportedBrowser}
      type="warning"
      title={intl("unsupported-browser.title")}
      description={intl("unsupported-browser.description")}
      actions={{
        primary: {
          label: intl("webrtc-check.confirm"),
          onClick: () => {
            location.href = CHROME_LINK;
            close();
          },
        },
      }}
      icon={<Switch />}
    />
  );
}
