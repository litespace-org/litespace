import { Dialog } from "@/components/Dialog";
import { Typography } from "@/components/Typography";
import { EnterPhoneNumber } from "@/components/VerifyPhoneDialog";
import { SelectMethod } from "@/components/VerifyPhoneDialog";
import { UnresolvedPhone } from "@/components/VerifyPhoneDialog";
import { VerifyCode } from "@/components/VerifyPhoneDialog";
import { useFormatMessage } from "@/hooks";
import { Void } from "@litespace/types";
import React, { useState } from "react";
import { Method } from "@/components/VerifyPhoneDialog/utils";

type Payload = {
  method: Method;
  phone: string;
};

type Props = {
  close: Void;
  phone: string | null;
  sendCode(payload: Payload): void;
  sendingCode: boolean;
  sentCode: boolean;
  unresolvedPhone: boolean;
  verifyCode(code: number): void;
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
    >
      {/* ================= phone ================= */}
      {!phone ? <EnterPhoneNumber close={close} setPhone={setPhone} /> : null}

      {/* ================= method ================= */}
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

      {/* ================= unresolved phone ================= */}
      {unresolvedPhone && phone ? (
        <UnresolvedPhone
          resend={() => {
            if (!method) return;
            sendCode({ phone, method });
          }}
          sendingCode={sendingCode}
        />
      ) : null}

      {/* ================= confirmation code ================= */}
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
