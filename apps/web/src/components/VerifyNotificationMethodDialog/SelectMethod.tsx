import { Typography } from "@litespace/ui/Typography";
import { MethodButton } from "@/components/VerifyNotificationMethodDialog/MethodButton";
import Telegram from "@litespace/assets/TelegramWithoutCircle";
import WhatsApp from "@litespace/assets/WhatsApp";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { IUser, Void } from "@litespace/types";
import { Button } from "@litespace/ui/Button";
import React, { useState } from "react";

type Props = {
  selected: IUser.NotificationMethodLiteral | null;
  select: (method: IUser.NotificationMethodLiteral) => void;
  close: Void;
};

export const Method: React.FC<Props> = ({ selected, select, close }) => {
  const intl = useFormatMessage();
  const [method, setMethod] = useState<IUser.NotificationMethodLiteral | null>(
    selected
  );

  return (
    <div>
      <Typography
        tag="p"
        className="text-caption mt-2 font-semibold text-natural-950"
      >
        {intl("notification-method.dialog.method.description")}
      </Typography>
      <div className="flex gap-6 mt-6 w-full h-[152px]">
        <MethodButton
          activeColor="bg-telegram hover:bg-telegram"
          icon={<Telegram className="w-[32px] h-[32px]" />}
          isActive={method === "telegram"}
          onClick={() => setMethod("telegram")}
          method="telegram"
        />
        <MethodButton
          method="whatsapp"
          activeColor="bg-whatsapp hover:bg-whatsapp"
          icon={
            <WhatsApp className="w-[32px] h-[32px] [&>*]:fill-natural-50" />
          }
          isActive={method === "whatsapp"}
          onClick={() => setMethod("whatsapp")}
        />
      </div>
      <div className="flex flex-row items-center gap-6 mt-6 w-full">
        <Button
          onClick={() => {
            if (!method) return;
            select(method);
          }}
          disabled={!method}
          size="large"
          className="grow"
        >
          {intl("labels.next")}
        </Button>
        <Button
          onClick={close}
          variant="secondary"
          className="grow"
          size="large"
        >
          {intl("labels.cancel")}
        </Button>
      </div>
    </div>
  );
};

export default Method;
