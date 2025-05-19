import { useOnError } from "@/hooks/error";
import {
  useSendPhoneCode,
  useVerifyPhoneCode,
} from "@litespace/headless/confirmationCode";
import { QueryKey } from "@litespace/headless/constants";
import { useInvalidateQuery } from "@litespace/headless/query";
import { IUser, Void } from "@litespace/types";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { useToast } from "@litespace/ui/Toast";
import { useCallback, useState } from "react";
import { VerifyNotificationMethodDialog } from "@/components/VerifyNotificationMethodDialog";

const VerifyNotifications: React.FC<{
  close: Void;
  selectedMethod: IUser.NotificationMethodLiteral | null;
  phone: string | null;
}> = ({ close, selectedMethod, phone }) => {
  const invalidateQuery = useInvalidateQuery();
  const toast = useToast();
  const intl = useFormatMessage();
  const [sentCode, setSentCode] = useState<boolean>(false);

  const onSendCodeSuccess = useCallback(() => {
    setSentCode(true);
    invalidateQuery([QueryKey.FindCurrentUser]);
  }, [invalidateQuery]);

  const onSendCodeError = useOnError({
    type: "mutation",
    handler: ({ messageId }) => {
      toast.error({
        title: intl("shared-settings.send-code.error"),
        description: intl(messageId),
      });
    },
  });

  const onVerifySuccess = useCallback(() => {
    invalidateQuery([QueryKey.FindCurrentUser]);
    close();
    setSentCode(false);
    toast.success({
      title: intl("shared-settings.verify-code.success"),
    });
  }, [invalidateQuery, close, intl, toast]);

  const onVerifyCodeError = useOnError({
    type: "mutation",
    handler: ({ messageId }) => {
      toast.error({
        title: intl("shared-settings.verify-code.error"),
        description: intl(messageId),
      });
    },
  });

  const sendPhoneCodeMutation = useSendPhoneCode({
    onSuccess: onSendCodeSuccess,
    onError: onSendCodeError,
  });
  const verifyPhoneCodeMutation = useVerifyPhoneCode({
    onSuccess: onVerifySuccess,
    onError: onVerifyCodeError,
  });

  return (
    <VerifyNotificationMethodDialog
      method={selectedMethod}
      close={close}
      phone={phone}
      sendCode={sendPhoneCodeMutation.mutate}
      sendingCode={sendPhoneCodeMutation.isPending}
      sentCode={sentCode}
      verifyCode={verifyPhoneCodeMutation.mutate}
      verifing={verifyPhoneCodeMutation.isPending}
    />
  );
};

export default VerifyNotifications;
