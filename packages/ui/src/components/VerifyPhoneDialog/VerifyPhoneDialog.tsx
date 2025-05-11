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

type VerifyPhoneDialog = {
  open: boolean;
  onClose: Void;
  phone: string | null;
  sendCode(payload: Payload): void;
  sendingCode: boolean;
  sentCode: boolean;
  unresolvedPhone: boolean;
  verifyCode(code: number): void;
  verifyingCode: boolean;
  resending: boolean;
};

export const VerifyPhoneDialog: React.FC<VerifyPhoneDialog> = ({
  open,
  onClose,
  phone: defaultPhone,
  sendCode,
  sendingCode,
  resending,
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
      open={open}
      close={onClose}
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
      {!phone ? <EnterPhoneNumber close={onClose} setPhone={setPhone} /> : null}

      {/* ================= method ================= */}
      {phone && !sentCode && !unresolvedPhone ? (
        <SelectMethod
          close={onClose}
          sendCode={(method) => {
            setMethod(method);
            sendCode({ phone, method });
          }}
          loading={sendingCode}
        />
      ) : null}

      {/* ================= unresolved phone ================= */}
      {unresolvedPhone ? (
        <UnresolvedPhone
          resend={() => {
            if (!phone || !method) return;
            sendCode({ phone, method });
          }}
          sendingCode={sendingCode}
        />
      ) : null}

      {/* ================= confirmation code ================= */}
      {phone && sentCode && !unresolvedPhone ? (
        <VerifyCode
          byWhatsapp={method === "whatsapp"}
          close={onClose}
          phone={phone}
          resend={() => {
            if (!method) return;
            sendCode({ phone, method });
          }}
          resending={resending}
          verifing={verifyingCode}
          verifyCode={verifyCode}
        />
      ) : null}
    </Dialog>
  );
};

export default VerifyPhoneDialog;
