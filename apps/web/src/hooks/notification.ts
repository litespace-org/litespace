import { router } from "@/lib/routes";
import { useUser } from "@litespace/headless/context/user";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { ToastAction } from "@litespace/ui/Toast";
import { Web } from "@litespace/utils/routes";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

export function useEnableNotificationsToastAction() {
  const intl = useFormatMessage();
  const navigate = useNavigate();
  const { user } = useUser();

  const action = useMemo(
    (): ToastAction => ({
      label: intl("labels.enable-notifications"),
      variant: "secondary",
      onClick() {
        navigate(
          router.web({
            route: Web.StudentSettings,
            query: { tab: "notifications" },
          })
        );
        return true;
      },
    }),
    [intl, navigate]
  );

  return { action, show: !user?.notificationMethod };
}
