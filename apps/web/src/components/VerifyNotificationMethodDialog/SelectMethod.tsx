import { Animate } from "@/components/Common/Animate";
import { Typography } from "@litespace/ui/Typography";
import { MethodButton } from "@/components/VerifyNotificationMethodDialog/MethodButton";
import Telegram1 from "@litespace/assets/Telegram1";
import Whatsapp from "@litespace/assets/WhatsApp";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { IUser, Void } from "@litespace/types";
import { Button } from "@litespace/ui/Button";

type SelectMethodProps = {
  activeMethod: IUser.NotificationMethodLiteral | null;
  changeMethod: (method: IUser.NotificationMethodLiteral) => void;
  select: Void;
  close: Void;
};

export function SelectMethod({
  activeMethod,
  select,
  changeMethod,
  close,
}: SelectMethodProps) {
  const intl = useFormatMessage();

  return (
    <Animate>
      <Typography
        tag="p"
        className="text-caption mt-2 font-semibold text-natural-950"
      >
        {intl("notification-method.dialog.method.description")}
      </Typography>
      <div className="flex gap-6 mt-6 w-full h-[152px]">
        <MethodButton
          activeColor="bg-notification-telegram hover:bg-notification-telegram"
          icon={<Telegram1 className="w-[60px] h-[60px]" />}
          method={"telegram"}
          isActive={activeMethod === "telegram"}
          onClick={() => changeMethod("telegram")}
        />
        <MethodButton
          activeColor="bg-notification-whatsapp hover:bg-notification-whatsapp"
          icon={
            <Whatsapp className="w-[60px] h-[60px] [&>*]:fill-natural-50" />
          }
          method={"whatsapp"}
          isActive={activeMethod === "whatsapp"}
          onClick={() => changeMethod("whatsapp")}
        />
      </div>
      <div className="flex gap-6 mt-6 w-full">
        <Button
          onClick={select}
          disabled={!activeMethod}
          size="large"
          className="grow"
        >
          {intl("labels.next")}
        </Button>
        <Button
          onClick={close}
          variant="secondary"
          size="large"
          className="grow"
        >
          {intl("labels.cancel")}
        </Button>
      </div>
    </Animate>
  );
}
