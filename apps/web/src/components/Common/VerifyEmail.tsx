import React, { useEffect, useCallback, useState } from "react";
import { useOnError } from "@/hooks/error";
import {
  useConfirmVerificationEmailCode,
  useSendVerificationEmailCode,
} from "@litespace/headless/confirmationCode";
import { Void, ApiError } from "@litespace/types";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { useToast } from "@litespace/ui/Toast";
import { VerifyEmailDialog } from "@/components/VerifyEmailDialog";
import { useUser } from "@litespace/headless/context/user";
import { useQueryClient } from "@tanstack/react-query";
import { QueryKey } from "@litespace/headless/constants";

type Props = {
  emailSent?: boolean;
  open: boolean;
  close: Void;
};

export const VerifyEmail: React.FC<Props> = ({ close, emailSent, open }) => {
  const [sent, setSent] = useState(emailSent);
  const toast = useToast();
  const intl = useFormatMessage();
  const { user } = useUser();
  const queryClient = useQueryClient();

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
    if (
      sent ||
      !open ||
      sendMutation.isPending ||
      sendMutation.isSuccess ||
      sendMutation.isError
    )
      return;
    setSent(true);
    sendMutation.mutate();
  }, [open, sendMutation, sent]);

  const onVerifySuccess = useCallback(async () => {
    close();
    sendMutation.reset();
    queryClient.invalidateQueries({ queryKey: [QueryKey.FindCurrentUser] });
    toast.success({ title: intl("verify-email-dialog.success") });
  }, [close, sendMutation, queryClient, toast, intl]);

  const onVerifyError = useOnError({
    type: "mutation",
    handler: ({ messageId, errorCode }) => {
      // If the confirmation code has expired, close the dialog
      if (errorCode === ApiError.ExpiredVerificationCode) {
        close();
        toast.error({
          title: intl("verify-email-dialog.error"),
          description: intl("error.api.expired-verification-code"),
        });
        return;
      }

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
      open={open}
      close={() => {
        close();
        sendMutation.reset();
      }}
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
