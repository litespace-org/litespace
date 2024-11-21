import { CALLBACK_URL } from "@/lib/route";
import { useSendVerifyEmail } from "@litespace/headless/auth";
import { useUser } from "@litespace/headless/user-ctx";
import { Button, ButtonSize, ButtonVariant } from "@litespace/luna/Button";
import { useFormatMessage } from "@litespace/luna/hooks/intl";
import { Input } from "@litespace/luna/Input";
import { useToast } from "@litespace/luna/Toast";
import { Tooltip } from "@litespace/luna/Tooltip";
import { Typography } from "@litespace/luna/Typography";
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

  const onError = useCallback(
    (error: Error) => {
      toast.error({
        title: intl("dashboard.user-settings.send-verify.success"),
        description: error.message,
      });
    },
    [toast, intl]
  );

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

        {user.verified ? (
          <Tooltip
            content={
              <Typography>
                {intl("dashboard.user-settings.verified")}
              </Typography>
            }
          >
            <Check className="text-success-500" />
          </Tooltip>
        ) : (
          <Button
            size={ButtonSize.Tiny}
            variant={ButtonVariant.Secondary}
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
