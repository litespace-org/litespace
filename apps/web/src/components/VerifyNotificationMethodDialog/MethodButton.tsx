import { IUser, Void } from "@litespace/types";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { LocalId } from "@litespace/ui/locales";
import { Typography } from "@litespace/ui/Typography";
import cn from "classnames";

type MethodButtonProps = {
  method: IUser.NotificationMethodLiteral;
  isActive?: boolean;
  onClick?: Void;
  activeColor: string;
  icon: React.ReactNode;
};

const NOTFICATION_METHOD_TO_INTL_MSG_ID: Record<
  IUser.NotificationMethodLiteral,
  LocalId
> = {
  telegram: "notification-method.telegram",
  whatsapp: "notification-method.whatsapp",
};

export function MethodButton({
  isActive,
  icon,
  method,
  activeColor,
  onClick,
}: MethodButtonProps) {
  const intl = useFormatMessage();

  return (
    <button
      onClick={onClick}
      type="button"
      className={cn(
        "relative grow overflow-hidden rounded-2xl transition-colors duration-200 bg-natural-200",
        "focus-visible:ring-secondary-500 focus-visible:ring-offset-2 focus-visible:outline-none focus-visible:ring-2",
        !isActive && "hover:bg-natural-300"
      )}
    >
      <div
        className={cn(
          "absolute w-full h-full top-0 left-0 duration-200 transition-opacity pointer-events-none ",
          isActive ? "opacity-100" : "opacity-0",
          activeColor
        )}
      />
      <div className="flex absolute w-full h-full top-0 left-0 grow flex-col items-center justify-center gap-2">
        {icon}
        <Typography
          tag="p"
          className={"text-subtitle-1 font-medium text-natural-50"}
        >
          {intl(NOTFICATION_METHOD_TO_INTL_MSG_ID[method])}
        </Typography>
      </div>
    </button>
  );
}
