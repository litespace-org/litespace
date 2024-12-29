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
import { useNavigate } from "react-router-dom";
import { Route } from "@/types/routes";
import { useAtlas } from "@litespace/headless/atlas";
import { useUserContext } from "@litespace/headless/context/user";

const GoogleAuth: React.FC<{
  purpose: "login" | "register";
  role?: typeof IUser.Role.Tutor | typeof IUser.Role.Student;
}> = ({ purpose, role }) => {
  const intl = useFormatMessage();
  const media = useMediaQueries();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);
  const atlas = useAtlas();
  const toast = useToast();
  const user = useUserContext();

  const onGoogleSuccess = useCallback(
    async (response: CredentialResponse) => {
      setLoading(true);
      const error = await safe(async () => {
        if (!response.credential)
          throw new Error(
            "Cannot authenticate using Google. Missing token credentials"
          );
        const info = await atlas.auth.google(response.credential, role);
        user.set(info);
        navigate(Route.Root);
      });
      setLoading(false);

      if (error)
        toast.error({
          title: intl(
            purpose === "login" ? "page.login.failed" : "page.register.failed"
          ),
          description: error.message,
        });
    },
    [atlas.auth, intl, navigate, purpose, role, toast, user]
  );

  const onGoogleError = useCallback(() => {}, []);

  return (
    <div className="relative">
      <div className={cn(loading && "opacity-50")}>
        <GoogleLogin
          onSuccess={onGoogleSuccess}
          onError={onGoogleError}
          auto_select
          theme={theme === "light" ? "outline" : "filled_black"}
          size="large"
          shape="square"
          width={media.sm ? "384" : "330"}
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
