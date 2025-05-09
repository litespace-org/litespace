import { IConfirmationCode, IUser, Void } from "@litespace/types";
import { Dialog } from "@litespace/ui/Dialog";
import { AnimatePresence } from "framer-motion";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { useCallback, useEffect, useState } from "react";
import { SelectMethod } from "@/components/VerifyNotificationMethodDialog/SelectMethod";
import { VerifyCode } from "@/components/VerifyNotificationMethodDialog/VerifyCode";
import { EnterPhoneNumber } from "@/components/VerifyNotificationMethodDialog/EnterPhoneNumber";
import { Typography } from "@litespace/ui/Typography";

type Props = {
  close: Void;
  method: IUser.NotificationMethodLiteral | null;
  phone: string | null;
  sendCode: (payload: IConfirmationCode.SendVerifyPhoneCodePayload) => void;
  sending: boolean;
  verifyCode: (payload: IConfirmationCode.VerifyPhoneCodePayload) => void;
  verifing: boolean;
};

type Step = "method" | "phone" | "code";

export function VerifyNotificationMethodDialog({
  close,
  method,
  phone,
  sending,
  sendCode,
  verifyCode,
  verifing,
}: Props) {
  const intl = useFormatMessage();
  const [step, setStep] = useState<Step>();
  const [activeMethod, setActiveMethod] =
    useState<IUser.NotificationMethodLiteral | null>(method);
  const [phoneNumber, setPhoneNumber] = useState<string | null>(phone);

  const changeMethod = useCallback(
    (method: IUser.NotificationMethodLiteral) => {
      setActiveMethod(method);
    },
    []
  );

  const changeStep = useCallback((step: Step) => {
    setStep(step);
  }, []);

  const sendVerificationCode = useCallback(() => {
    if (!activeMethod || !phoneNumber) return;

    sendCode({
      method: activeMethod,
      phone: phoneNumber,
    });
    changeStep("code");
  }, [phoneNumber, activeMethod, changeStep, sendCode]);

  const verifyConfirmationCode = useCallback(
    (code: number) => {
      if (!activeMethod) return;
      verifyCode({ code, method: activeMethod });
    },
    [verifyCode, activeMethod]
  );

  // To auto detect the step
  useEffect(() => {
    if (step !== undefined) return;

    if (phone && method) {
      sendVerificationCode();
      return;
    }

    if (method && !phone) {
      setStep("phone");
      return;
    }

    setStep("method");
  }, [method, phone, sendVerificationCode, step]);

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
      className="w-[512px] font-cairo"
      open
      close={close}
    >
      <AnimatePresence mode="wait">
        {step === "method" ? (
          <SelectMethod
            activeMethod={activeMethod}
            changeMethod={changeMethod}
            select={() => changeStep("phone")}
            close={close}
          />
        ) : null}

        {step === "phone" ? (
          <EnterPhoneNumber
            close={close}
            phoneNumber={phoneNumber}
            sendVerificationCode={sendVerificationCode}
            sending={sending}
            setPhoneNumber={setPhoneNumber}
          />
        ) : null}

        {step === "code" ? (
          <VerifyCode
            activeMethod={activeMethod}
            phoneNumber={phoneNumber}
            sendVerificationCode={sendVerificationCode}
            verifyCode={verifyConfirmationCode}
            verifing={verifing}
            close={close}
          />
        ) : null}
      </AnimatePresence>
    </Dialog>
  );
}
