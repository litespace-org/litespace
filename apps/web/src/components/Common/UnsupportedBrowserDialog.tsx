import { ConfirmationDialog } from "@litespace/ui/ConfirmationDialog";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import Switch from "@litespace/assets/Switch";
import { useMemo } from "react";

export function UnsupportedBrowserDialog() {
  const intl = useFormatMessage();

  const unsupportedBrowser = useMemo<boolean>(() => {
    const keywords = [/messenger/i, /facebook/i, /FB/, /FB_IAB/];
    if (!navigator.userAgent) return true;
    for (const word of keywords)
      if (navigator.userAgent.search(word) !== -1) return true;
    return false;
  }, []);

  const openInChrome = () => {
    const currentUrl = "https://app.litespace.org/login";

    // Android: Use Android Intent
    if (/Android/.test(navigator.userAgent)) {
      const intentUrl = `intent://${currentUrl.replace(
        /^https?:\/\//,
        ""
      )}#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=${encodeURIComponent(
        "https://www.google.com/chrome/"
      )};end`;

      // Try to open Chrome
      window.location.href = intentUrl;

      // Fallback to Chrome download if intent fails (common)
      setTimeout(() => {
        window.location.href = "https://www.google.com/chrome/";
      }, 1500);

      return;
    }

    // iOS: Open Chrome App Store (can't deep-link directly)
    if (/iPad|iPhone|iPod/.test(navigator.platform)) {
      window.location.href =
        "https://apps.apple.com/app/google-chrome/id535886823";
      return;
    }

    // Desktop: Try googlechrome:// (rarely works), fallback to download
    const chromeProtocolUrl = `googlechrome://navigate?url=${encodeURIComponent(
      currentUrl
    )}`;
    window.location.href = chromeProtocolUrl;

    setTimeout(() => {
      window.location.href = "https://www.google.com/chrome/";
    }, 1500);
  };

  return (
    <ConfirmationDialog
      open={unsupportedBrowser}
      type="warning"
      title={intl("unsupported-browser.title")}
      description={intl("unsupported-browser.description")}
      actions={{
        primary: {
          label: intl("webrtc-check.confirm"),
          onClick: openInChrome,
        },
      }}
      icon={<Switch />}
    />
  );
}
