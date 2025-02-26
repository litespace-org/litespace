import { useAtlas } from "@litespace/headless/atlas";
import { useUserContext } from "@litespace/headless/context/user";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { useToast } from "@litespace/ui/Toast";
import { safe } from "@litespace/utils/error";
import { IUser } from "@litespace/types";
import { useGoogleLogin, useGoogleOneTapLogin } from "@react-oauth/google";
import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { capture } from "@/lib/sentry";
import { Web } from "@litespace/utils/routes";

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
  const [loading, setLoading] = useState<boolean>(false);
  const atlas = useAtlas();
  const user = useUserContext();
  const navigate = useNavigate();
  const toast = useToast();
  const intl = useFormatMessage();

  const auth = useCallback(
    async (token: string, type: "bearer" | "id-token") => {
      setLoading(false);
      const info = await safe(async () =>
        atlas.auth.google({ token, type, role })
      );

      if (info instanceof Error)
        return toast.error({ title: intl("login.error") });
      user.set(info);

      if (redirect) return navigate(redirect);
      if (role) return navigate(Web.CompleteProfile);
      return navigate(Web.Root);
    },
    [atlas.auth, intl, navigate, redirect, role, toast, user]
  );

  const onError = useCallback(
    (error?: unknown) => {
      capture(error);
      console.error(error);
      setLoading(false);
      if (!isPopupClosedError(error))
        toast.error({ title: intl(role ? "register.error" : "login.error") });
    },
    [intl, role, toast]
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
