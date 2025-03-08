import { CALLBACK_URL } from "@/lib/route";
import { useSendVerifyEmail } from "@litespace/headless/auth";
import { useUserContext } from "@litespace/headless/context/user";
import { Button } from "@litespace/ui/Button";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Input } from "@litespace/ui/Input";
import { useToast } from "@litespace/ui/Toast";
import { Tooltip } from "@litespace/ui/Tooltip";
import { Typography } from "@litespace/ui/Typography";
import React, { useCallback } from "react";
import { Check } from "react-feather";

const VerificationDetails: React.FC = () => {
  const { user } = useUserContext();
  const intl = useFormatMessage();
  const toast = useToast();

  const onSuccess = useCallback(() => {
    toast.success({
      title: intl("dashboard.user-settings.send-verify.success"),
    });
  }, [toast, intl]);

  const onError = useCallback(() => {
    toast.error({
      title: intl("dashboard.user-settings.send-verify.success"),
      // description: error.message,
    });
  }, [toast, intl]);

  const reverify = useSendVerifyEmail({ onSuccess, onError });

  const reverifyEmail = useCallback(() => {
    reverify.mutate(CALLBACK_URL);
  }, [reverify]);

  if (!user) return null;

  return (
    <div>
      <div className="flex flex-row items-center gap-4">
        <div className="w-56">
          <Input value={user.email} readOnly />
        </div>

        {user.verifiedEmail ? (
          <Tooltip
            content={
              <Typography tag="span">
                {intl("dashboard.user-settings.verified")}
              </Typography>
            }
          >
            <Check className="text-success-500" />
          </Tooltip>
        ) : (
          <Button
            size={"small"}
            variant={"secondary"}
            onClick={reverifyEmail}
            loading={reverify.isPending}
            disabled={reverify.isPending}
          >
            {intl("dashboard.user-settings.send-verify")}
          </Button>
        )}
      </div>
    </div>
  );
};

export default VerificationDetails;
