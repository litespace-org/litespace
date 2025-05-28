import React, { useCallback } from "react";
import { useOnError } from "@/hooks/error";
import {
  useConfirmForgetPasswordCode,
  useSendForgetPasswordCode,
} from "@litespace/headless/confirmationCode";
import { ApiError, Void } from "@litespace/types";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { useToast } from "@litespace/ui/Toast";
import { ForgetPasswordDialog } from "@litespace/ui/ForgetPasswordDialog";

type Props = {
  close: Void;
};

export const ForgetPassword: React.FC<Props> = ({ close }) => {
  const toast = useToast();
  const intl = useFormatMessage();

  const onSendError = useOnError({
    type: "mutation",
    handler: ({ messageId }) => {
      toast.error({
        title: intl("send-forget-password.email.error"),
        description: intl(messageId),
      });
    },
  });

  const sendMutation = useSendForgetPasswordCode({
    onError: onSendError,
  });

  const onResetSuccess = useCallback(() => {
    close();
    toast.success({
      title: intl("reset-password-dialog.success"),
    });
  }, [close, toast, intl]);

  const onResetError = useOnError({
    type: "mutation",
    handler: ({ messageId, errorCode }) => {
      if (
        errorCode === ApiError.InvalidVerificationCode ||
        errorCode === ApiError.ExpiredVerificationCode
      )
        sendMutation.reset();

      toast.error({
        title: intl("reset-password-dialog.error"),
        description: intl(messageId),
      });
    },
  });

  const resetMutation = useConfirmForgetPasswordCode({
    onSuccess: onResetSuccess,
    onError: onResetError,
  });

  return (
    <ForgetPasswordDialog
      resetPassword={resetMutation.mutate}
      resettingPassword={resetMutation.isPending}
      sendCode={(email) => sendMutation.mutate({ email })}
      sendingCode={sendMutation.isPending}
      sentCode={sendMutation.isSuccess}
      resendCode={(email) => {
        sendMutation.reset();
        sendMutation.mutate({ email });
      }}
      close={close}
      open
    />
  );
};
