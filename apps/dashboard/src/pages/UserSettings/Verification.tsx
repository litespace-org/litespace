import { Route } from "@/lib/route";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { findCurrentUser, profileSelectors } from "@/redux/user/profile";
import { useAtlas } from "@litespace/headless/atlas";
import { useReVerifyEmail } from "@litespace/headless/auth";
import {
  Button,
  ButtonSize,
  ButtonType,
  ButtonVariant,
} from "@litespace/luna/Button";
import { useFormatMessage } from "@litespace/luna/hooks/intl";
import { useToast } from "@litespace/luna/Toast";
import { useCallback } from "react";
import { Check, X } from "react-feather";
import { useNavigate } from "react-router-dom";

const VerificationDetails = () => {
  const user = useAppSelector(profileSelectors.user);
  const atlas = useAtlas();
  const dispatch = useAppDispatch();
  const intl = useFormatMessage();
  const navigate = useNavigate();
  const toast = useToast();

  const onSuccess = useCallback(() => {
    toast.success({
      title: intl("dashboard.user-settings.send-verify.success"),
    });
    dispatch(findCurrentUser.call(atlas));
  }, [toast, dispatch, atlas, intl]);

  const onError = useCallback(
    (e: Error) => {
      toast.error({
        title: intl("dashboard.user-settings.send-verify.success"),
        description: e.message,
      });
    },
    [toast, intl]
  );

  const reverify = useReVerifyEmail({ onSuccess, onError });

  if (!user) {
    navigate(Route.Login);
    return null;
  }
  const reverifyEmail = () => {
    reverify.mutate(window.location.origin.concat(Route.VerifyEmail));
  };

  return (
    <div className="mt-4">
      {user.verified ? (
        <div className="text-xl flex items-center">
          {intl("dashboard.user-settings.verified")}{" "}
          <Check className="w-8 h-8 text-success-500" />
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <div className="text-xl flex items-center">
            {intl("dashboard.user-settings.unverified")}
            <X className="w-8 h-8 text-destructive-500" />
          </div>
          <Button
            className="mt-2"
            onClick={reverifyEmail}
            loading={reverify.isPending}
            type={ButtonType.Success}
            variant={ButtonVariant.Secondary}
            size={ButtonSize.Tiny}
            disabled={reverify.isPending}
          >
            {intl("dashboard.user-settings.send-verify")}
          </Button>
        </div>
      )}
    </div>
  );
};

export default VerificationDetails;
