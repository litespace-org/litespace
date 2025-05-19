import React, { useEffect, useCallback, useState } from "react";
import { useOnError } from "@/hooks/error";
import {
  useConfirmVerificationEmailCode,
  useSendVerificationEmailCode,
} from "@litespace/headless/confirmationCode";
import { Void } from "@litespace/types";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { useToast } from "@litespace/ui/Toast";
import { VerifyEmailDialog } from "@litespace/ui/VerifyEmailDialog";
import { useUserContext } from "@litespace/headless/context/user";

type Props = {
  close: Void;
  emailSent?: boolean;
};

export const VerifyEmail: React.FC<Props> = ({ close, emailSent }) => {
  const [sent, setSent] = useState(emailSent);
  const toast = useToast();
  const intl = useFormatMessage();
  const { user, refetch } = useUserContext();

  const onSendError = useOnError({
    type: "mutation",
    handler: ({ messageId }) => {
      toast.error({
        title: intl("send-verification-email.error"),
        description: intl(messageId),
      });
    },
  });

  const sendMutation = useSendVerificationEmailCode({
    onError: onSendError,
  });

  useEffect(() => {
    if (sent) return;
    setSent(true);
    sendMutation.mutate();
  }, [sendMutation, sent]);

  const onVerifySuccess = useCallback(() => {
    close();
    refetch.user();
    toast.success({
      title: intl("verify-email-dialog.success"),
    });
  }, [close, refetch, toast, intl]);

  const onVerifyError = useOnError({
    type: "mutation",
    handler: ({ messageId }) => {
      toast.error({
        title: intl("verify-email-dialog.error"),
        description: intl(messageId),
      });
    },
  });

  const verifyMutation = useConfirmVerificationEmailCode({
    onSuccess: onVerifySuccess,
    onError: onVerifyError,
  });

  if (!user) return null;

  return (
    <VerifyEmailDialog
      open
      close={close}
      email={user.email}
      sending={sendMutation.isPending}
      verifiying={verifyMutation.isPending}
      verify={verifyMutation.mutate}
      resend={() => {
        sendMutation.mutate();
        setSent(true);
      }}
    />
  );
};
