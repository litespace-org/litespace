import { useRef, useEffect, useCallback } from "react";
import { useOnError } from "@/hooks/error";
import {
  useConfirmVerificationEmailCode,
  useSendVerificationEmailCode,
} from "@litespace/headless/auth";
import { Void } from "@litespace/types";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { useToast } from "@litespace/ui/Toast";
import { VerifyEmailDialog } from "@litespace/ui/VerifyEmailDialog";
import { useUserContext } from "@litespace/headless/context/user";

export function VerifyEmail({ close }: { close: Void }) {
  const hasSentRef = useRef(false);

  const toast = useToast();
  const intl = useFormatMessage();

  const { user, refetch } = useUserContext();

  const onSendSuccess = useCallback(() => {
    hasSentRef.current = true;
    toast.success({
      title: intl("send-verification-email.success.title"),
      description: intl("send-verification-email.success.description"),
    });
  }, [toast, intl]);

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
    onSuccess: onSendSuccess,
    onError: onSendError,
  });

  useEffect(() => {
    if (hasSentRef.current) return;
    sendMutation.mutate();
    hasSentRef.current = true;
  }, [sendMutation]); // Empty dependency array = run once per mount

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
      email={user.email}
      close={close}
      open
      sending={sendMutation.isPending}
      verifiying={verifyMutation.isPending}
      verify={verifyMutation.mutate}
      resend={() => {
        sendMutation.mutate();
        hasSentRef.current = true;
      }}
    />
  );
}
