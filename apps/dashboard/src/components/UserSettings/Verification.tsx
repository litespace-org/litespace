import { useSendVerificationEmailCode } from "@litespace/headless/confirmationCode";
import { useUser } from "@litespace/headless/context/user";
import { Button } from "@litespace/ui/Button";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Input } from "@litespace/ui/Input";
import { useToast } from "@litespace/ui/Toast";
import { Tooltip } from "@litespace/ui/Tooltip";
import { Typography } from "@litespace/ui/Typography";
import React, { useCallback } from "react";
import { Check } from "react-feather";

const VerificationDetails: React.FC = () => {
  const { user } = useUser();
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

  const verify = useSendVerificationEmailCode({ onSuccess, onError });

  const verifyEmail = useCallback(() => {
    verify.mutate();
  }, [verify]);

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
            onClick={verifyEmail}
            loading={verify.isPending}
            disabled={verify.isPending}
          >
            {intl("dashboard.user-settings.send-verify")}
          </Button>
        )}
      </div>
    </div>
  );
};

export default VerificationDetails;
