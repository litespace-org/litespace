import { IConfirmationCode, IUser, Void } from "@litespace/types";
import { Dialog } from "@litespace/ui/Dialog";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { useState } from "react";
import Method from "@/components/VerifyNotificationMethodDialog/SelectMethod";
import Code from "@/components/VerifyNotificationMethodDialog/Code";
import { PhoneNumber } from "@/components/VerifyNotificationMethodDialog/PhoneNumber";
import { Typography } from "@litespace/ui/Typography";
import { useMediaQuery } from "@litespace/headless/mediaQuery";
import UnresolvedPhone from "@/components/VerifyNotificationMethodDialog/UnresolvedPhone";

type Props = {
  close: Void;
  method: IUser.NotificationMethodLiteral | null;
  phone: string | null;
  sendCode: (payload: IConfirmationCode.SendVerifyPhoneCodePayload) => void;
  sendingCode: boolean;
  sentCode: boolean;
  verifyCode: (payload: IConfirmationCode.VerifyPhoneCodePayload) => void;
  verifing: boolean;
  unresolvedPhone: boolean;
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
  unresolvedPhone,
}) => {
  const intl = useFormatMessage();
  const [method, setMethod] = useState<IUser.NotificationMethodLiteral | null>(
    defaultMethod
  );
  const [phone, setPhone] = useState<string | null>(defaultPhone);
  const mq = useMediaQuery();

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
      position={mq.sm ? "center" : "bottom"}
      className={mq.sm ? "w-[512px]" : "w-full"}
      close={close}
      open
    >
      {method === null ? (
        <Method
          selected={method}
          select={(method) => setMethod(method)}
          close={close}
        />
      ) : null}

      {method && !sentCode ? (
        <PhoneNumber
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

      {unresolvedPhone && phone ? (
        <UnresolvedPhone
          resend={() => {
            if (!method) return;
            sendCode({ phone, method });
          }}
          sendingCode={sendingCode}
        />
      ) : null}

      {sentCode && !unresolvedPhone && phone && method ? (
        <Code
          phone={phone}
          resend={() => sendCode({ method, phone })}
          resending={sendingCode}
          verifyCode={(code: number) => verifyCode({ code, method })}
          verifing={verifing}
          close={close}
        />
      ) : null}
    </Dialog>
  );
};
