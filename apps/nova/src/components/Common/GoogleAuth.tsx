import { useFormatMessage } from "@litespace/luna/hooks/intl";
import { useTheme } from "@litespace/luna/hooks/theme";
import { useMediaQueries } from "@litespace/luna/hooks/media";
import { useToast } from "@litespace/luna/Toast";
import { Spinner } from "@litespace/luna/Spinner";
import { CredentialResponse, GoogleLogin } from "@react-oauth/google";
import React, { useCallback, useState } from "react";
import cn from "classnames";
import { safe } from "@litespace/sol/error";
import { IUser } from "@litespace/types";

const GoogleAuth: React.FC<{
  purpose: "login" | "register";
  role?: typeof IUser.Role.Tutor | typeof IUser.Role.Student;
}> = ({ purpose }) => {
  const intl = useFormatMessage();
  const media = useMediaQueries();
  const { theme } = useTheme();
  const [loading, setLoading] = useState<boolean>(false);
  const toast = useToast();

  const onGoogleSuccess = useCallback(
    async (response: CredentialResponse) => {
      setLoading(true);
      const error = await safe(async () => {
        if (!response.credential)
          throw new Error(
            "Cannot authenticate using Google. Missing token credentials"
          );
        // const info = await atlas.auth.google(response.credential, role);
        // user.set(info);
        // navigate(Route.Root);
      });
      setLoading(false);

      if (error)
        toast.error({
          title: intl(purpose === "login" ? "login.error" : "register.error"),
          description: error.message,
        });
    },
    [intl, purpose, toast]
  );

  const onGoogleError = useCallback(() => {}, []);

  return (
    <div className="relative">
      <div
        className={cn(
          "flex items-center justify-center",
          loading && "opacity-50"
        )}
      >
        <GoogleLogin
          onSuccess={onGoogleSuccess}
          onError={onGoogleError}
          auto_select
          theme={theme === "light" ? "outline" : "filled_black"}
          size="large"
          shape="rectangular"
          width={media.sm ? "450" : "330"}
          context={purpose === "register" ? "signup" : "signin"}
          text={purpose === "register" ? "continue_with" : "signin_with"}
          useOneTap
        />
      </div>

      {loading ? (
        <Spinner className="absolute top-[22.5px] left-1/2 -translate-x-1/2 -translate-y-1/2" />
      ) : null}
    </div>
  );
};

export default GoogleAuth;
