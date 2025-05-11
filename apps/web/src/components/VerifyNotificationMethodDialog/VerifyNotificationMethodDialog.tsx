import { IConfirmationCode, IUser, Void } from "@litespace/types";
import { Dialog } from "@litespace/ui/Dialog";
import { AnimatePresence } from "framer-motion";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { useState } from "react";
import { SelectMethod } from "@/components/VerifyNotificationMethodDialog/SelectMethod";
import { VerifyCode } from "@/components/VerifyNotificationMethodDialog/VerifyCode";
import { EnterPhoneNumber } from "@/components/VerifyNotificationMethodDialog/EnterPhoneNumber";
import { Typography } from "@litespace/ui/Typography";

type Props = {
  close: Void;
  method: IUser.NotificationMethodLiteral | null;
  phone: string | null;
  sendCode: (payload: IConfirmationCode.SendVerifyPhoneCodePayload) => void;
  sendingCode: boolean;
  sentCode: boolean;
  verifyCode: (payload: IConfirmationCode.VerifyPhoneCodePayload) => void;
  verifing: boolean;
};

export const VerifyNotificationMethodDialog: React.FC<Props> = ({
  close,
  method: defaultMethod,
  phone: defaultPhone,
  sendingCode,
  sentCode,
  sendCode,
  verifyCode,
  verifing,
}) => {
  const intl = useFormatMessage();
  const [method, setMethod] = useState<IUser.NotificationMethodLiteral | null>(
    defaultMethod
  );
  const [phone, setPhone] = useState<string | null>(defaultPhone);

  return (
    <Dialog
      title={
        <Typography
          tag="h2"
          className="text-subtitle-1 font-bold text-natural-950"
        >
          {intl("notification-method.dialog.title")}
        </Typography>
      }
      className="w-[512px]"
      open
      close={close}
    >
      <AnimatePresence mode="wait">
        {method === null ? (
          <SelectMethod
            selected={method}
            select={(method) => setMethod(method)}
            close={close}
          />
        ) : null}

        {method !== null && !sentCode ? (
          <EnterPhoneNumber
            close={close}
            phone={phone}
            loading={sendingCode}
            setPhone={(phone) => {
              setPhone(phone);
              if (!phone || !method) return;
              sendCode({ method, phone });
            }}
          />
        ) : null}

        {sentCode && phone && method ? (
          <VerifyCode
            phone={phone}
            resend={() => sendCode({ method, phone })}
            resending={sendingCode}
            verifyCode={(code: number) => verifyCode({ code, method })}
            verifing={verifing}
            close={close}
          />
        ) : null}
      </AnimatePresence>
    </Dialog>
  );
};
