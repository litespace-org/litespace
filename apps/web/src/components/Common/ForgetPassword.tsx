import { useCallback } from "react";
import { useOnError } from "@/hooks/error";
import {
  useResetPasswordByCode,
  useSendForgetPasswordCode,
} from "@litespace/headless/auth";
import { Void } from "@litespace/types";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { useToast } from "@litespace/ui/Toast";
import { ForgetPasswordDialog } from "@litespace/ui/ForgetPasswordDialog";

export function ForgetPassword({ close }: { close: Void }) {
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
    handler: ({ messageId }) => {
      toast.error({
        title: intl("reset-password-dialog.error"),
        description: intl(messageId),
      });
    },
  });

  const resetMutation = useResetPasswordByCode({
    onSuccess: onResetSuccess,
    onError: onResetError,
  });

  return (
    <ForgetPasswordDialog
      resetPassword={resetMutation.mutate}
      resettingPassword={resetMutation.isPending}
      sendCode={sendMutation.mutateAsync}
      sendingCode={sendMutation.isPending}
      close={close}
      open
    />
  );
}
