import { VerifyPhoneDialog } from "@/components/VerifyPhoneDialog/VerifyPhoneDialog";
import { useOnError } from "@/hooks/error";
import {
  useSendPhoneCode,
  useVerifyPhoneCode,
} from "@litespace/headless/confirmationCode";
import { useUser } from "@litespace/headless/context/user";
import { ApiError, Void } from "@litespace/types";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { useToast } from "@litespace/ui/Toast";
import { useCallback, useState } from "react";

const VerifyPhone: React.FC<{
  close: Void;
  open: boolean;
  phone: string | null;
}> = ({ phone, close, open }) => {
  const { refetch } = useUser();
  const [sentCode, setSentCode] = useState<boolean>(false);
  const [unresolvedPhone, setUnresolvedPhone] = useState<boolean>(false);
  const toast = useToast();
  const intl = useFormatMessage();

  const onSendSuccess = useCallback(() => {
    setSentCode(true);
    setUnresolvedPhone(false);
  }, []);

  const onSendError = useOnError({
    type: "mutation",
    handler: ({ messageId, errorCode }) => {
      if (errorCode === ApiError.UnresolvedPhone) setUnresolvedPhone(true);
      toast.error({
        title: intl("send-verification-code.error"),
        description: intl(messageId),
      });
    },
  });

  const sendMutation = useSendPhoneCode({
    onSuccess: onSendSuccess,
    onError: onSendError,
  });

  const onVerifySuccess = useCallback(() => {
    close();
    refetch.user();
    toast.success({
      title: intl("verify-phone-dialog.success"),
    });
  }, [close, refetch, toast, intl]);

  const onVerifyError = useOnError({
    type: "mutation",
    handler: ({ messageId }) => {
      toast.error({
        title: intl("verify-phone-dialog.error"),
        description: intl(messageId),
      });
    },
  });
  const verifyMutation = useVerifyPhoneCode({
    onSuccess: onVerifySuccess,
    onError: onVerifyError,
  });

  return (
    <VerifyPhoneDialog
      open={open}
      sendCode={sendMutation.mutate}
      sentCode={sentCode}
      sendingCode={sendMutation.isPending}
      verifyCode={verifyMutation.mutate}
      verifyingCode={verifyMutation.isPending}
      unresolvedPhone={unresolvedPhone}
      phone={phone}
      close={close}
    />
  );
};

export default VerifyPhone;
