import { router } from "@/lib/routes";
import { useUser } from "@litespace/headless/context/user";
import { Web } from "@litespace/utils/routes";
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

export function useEnableNotificationsToastAction() {
  const navigate = useNavigate();
  const { user } = useUser();

  const action = useCallback(
    () =>
      navigate(
        router.web({
          route: Web.StudentSettings,
          query: { tab: "notifications" },
        })
      ),
    [navigate]
  );

  return { action, show: !user?.notificationMethod };
}
