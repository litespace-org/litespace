import { MethodButton } from "@/components/VerifyPhoneDialog/MethodButton";
import Telegram from "@litespace/assets/TelegramWithoutCircle";
import WhatsApp from "@litespace/assets/WhatsApp";
import { IUser, Void } from "@litespace/types";
import { Button } from "@litespace/ui/Button";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Typography } from "@litespace/ui/Typography";
import React, { useState } from "react";

type Props = {
  close: Void;
  sending: boolean;
  sendCode: (method: IUser.NotificationMethodLiteral) => void;
};
export const SelectMethod: React.FC<Props> = ({ close, sendCode, sending }) => {
  const intl = useFormatMessage();
  const [method, setMethod] = useState<IUser.NotificationMethodLiteral | null>(
    null
  );

  return (
    <div>
      <Typography
        tag="p"
        className="text-caption mt-2 font-semibold text-natural-950"
      >
        {intl("verify-phone-dialog.method.description")}
      </Typography>
      <div className="flex gap-6 mt-6 w-full h-[152px]">
        <MethodButton
          method="whatsapp"
          activeColor="bg-whatsapp hover:bg-whatsapp"
          icon={
            <WhatsApp className="w-[32px] h-[32px] [&>*]:fill-natural-50 icon" />
          }
          isActive={method === "whatsapp"}
          disabled={sending}
          onClick={() => setMethod("whatsapp")}
        />
        <MethodButton
          activeColor="bg-telegram hover:bg-telegram"
          icon={<Telegram className="w-[32px] h-[32px] icon" />}
          isActive={method === "telegram"}
          disabled={sending}
          onClick={() => setMethod("telegram")}
          method="telegram"
        />
      </div>
      <div className="flex flex-row items-center gap-6 mt-6 w-full">
        <Button
          onClick={() => {
            if (!method) return;
            sendCode(method);
          }}
          disabled={!method || sending}
          loading={sending}
          size="large"
          className="grow flex-1 font-medium"
        >
          {intl("verify-phone-dialog.send-code")}
        </Button>
        <Button
          onClick={close}
          variant="secondary"
          className="grow flex-1 font-medium"
          size="large"
          disabled={sending}
        >
          {intl("labels.cancel")}
        </Button>
      </div>
    </div>
  );
};
