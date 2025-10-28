import { useApi } from "@litespace/headless/api";
import { useUser } from "@litespace/headless/context/user";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { useToast } from "@litespace/ui/Toast";
import { ResponseError, safe } from "@litespace/utils/error";
import { IUser } from "@litespace/types";
import { useGoogleLogin, useGoogleOneTapLogin } from "@react-oauth/google";
import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { capture } from "@/lib/sentry";
import { Landing, Web } from "@litespace/utils/routes";
import { getErrorMessageId } from "@litespace/ui/errorMessage";
import { dayjs, isRegularUser } from "@litespace/utils";
import { router } from "@/lib/routes";
import { useLogger } from "@litespace/headless/logger";

function isPopupClosedError(error: unknown) {
  return (
    error &&
    typeof error === "object" &&
    "type" in error &&
    typeof error.type === "string" &&
    error.type === "popup_closed"
  );
}

export function useGoogle({
  role,
  redirect,
}: {
  role?: IUser.Role.Student | IUser.Role.Tutor | IUser.Role.TutorManager;
  redirect?: string | null;
}) {
  const logger = useLogger();
  const [loading, setLoading] = useState<boolean>(false);
  const api = useApi();
  const user = useUser();
  const navigate = useNavigate();
  const toast = useToast();
  const intl = useFormatMessage();

  const auth = useCallback(
    async (token: string, type: "bearer" | "id-token") => {
      setLoading(false);
      const info = await safe(async () =>
        api.auth.google({ token, type, role })
      );

      if (info instanceof ResponseError) {
        if (info.statusCode === 404) {
          return navigate(
            router.web({
              route: Web.Register,
              role: "student",
            })
          );
        }
        return toast.error({
          title: intl("login.error"),
          description: intl(getErrorMessageId(info)),
        });
      }

      if (info instanceof Error) {
        return toast.error({
          title: intl("login.error"),
          description: intl(getErrorMessageId(info)),
        });
      }

      const regularUser = isRegularUser(info.user);
      if (info.user && !regularUser) {
        user.logout();
        return window.location.replace(
          router.landing({ route: Landing.Home, full: true })
        );
      }

      user.set(info);

      if (redirect) return navigate(redirect);

      if (
        role === IUser.Role.Student &&
        dayjs().diff(info.user.createdAt, "minutes") <= 5
      )
        return navigate(Web.CompleteProfile);

      return navigate(Web.Root);
    },
    [api.auth, intl, navigate, redirect, role, toast, user]
  );

  const onError = useCallback(
    (error?: unknown) => {
      capture(error);
      logger.error(error);
      setLoading(false);
      if (!isPopupClosedError(error))
        toast.error({ title: intl(role ? "register.error" : "login.error") });
    },
    [intl, logger, role, toast]
  );

  useGoogleOneTapLogin({
    async onSuccess({ credential }) {
      if (!credential) return;
      return auth(credential, "id-token");
    },
    onError,
  });

  const login = useGoogleLogin({
    async onSuccess(response) {
      return auth(response.access_token, "bearer");
    },
    onError,
    onNonOAuthError: onError,
  });

  return useMemo(
    () => ({
      login: () => {
        setLoading(true);
        login();
      },
      loading,
    }),
    [loading, login]
  );
}
