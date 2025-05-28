import { Dialog } from "@litespace/ui/Dialog";
import { Typography } from "@litespace/ui/Typography";
import PhoneNumber from "@/components/VerifyPhoneDialog/PhoneNumber";
import { SelectMethod } from "@/components/VerifyPhoneDialog/SelectMethod";
import { UnresolvedPhone } from "@/components/VerifyPhoneDialog/UnresolvedPhone";
import { VerifyCode } from "@/components/VerifyPhoneDialog/VerifyCode";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { IConfirmationCode, Void } from "@litespace/types";
import React, { useState } from "react";
import { Method } from "@/components/VerifyPhoneDialog/utils";

type Props = {
  close: Void;
  phone: string | null;
  sendCode(payload: IConfirmationCode.SendVerifyPhoneCodePayload): void;
  sendingCode: boolean;
  sentCode: boolean;
  unresolvedPhone: boolean;
  verifyCode(payload: IConfirmationCode.VerifyPhoneCodePayload): void;
  verifyingCode: boolean;
};

export const VerifyPhoneDialog: React.FC<Props> = ({
  close,
  phone: defaultPhone,
  sendCode,
  sendingCode,
  sentCode,
  unresolvedPhone,
  verifyCode,
  verifyingCode,
}) => {
  const intl = useFormatMessage();

  const [phone, setPhone] = useState<string | null>(defaultPhone);
  const [method, setMethod] = useState<Method | null>(null);

  return (
    <Dialog
      open
      close={close}
      title={
        <Typography
          tag="span"
          className="text-subtitle-1 font-bold text-natural-950"
        >
          {intl("verify-phone-dialog.title")}
        </Typography>
      }
      className="w-[512px]"
    >
      {!phone ? <PhoneNumber close={close} setPhone={setPhone} /> : null}

      {phone && !sentCode && !unresolvedPhone ? (
        <SelectMethod
          close={close}
          sendCode={(method) => {
            setMethod(method);
            sendCode({ phone, method });
          }}
          sending={sendingCode}
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

      {phone && sentCode && method && !unresolvedPhone ? (
        <VerifyCode
          method={method}
          close={close}
          phone={phone}
          resend={() => sendCode({ phone, method })}
          resending={sendingCode}
          verifing={verifyingCode}
          verifyCode={verifyCode}
        />
      ) : null}
    </Dialog>
  );
};

export default VerifyPhoneDialog;
