import {
  Method,
  PHONE_METHOD_TO_INTL_MSG_ID,
} from "@/components/VerifyPhoneDialog/utils";
import { Void } from "@litespace/types";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Typography } from "@litespace/ui/Typography";
import cn from "classnames";
import React from "react";

type Props = {
  method: Method;
  isActive?: boolean;
  onClick?: Void;
  activeColor: string;
  icon: React.ReactNode;
};

export const MethodButton: React.FC<Props> = ({
  isActive,
  icon,
  method,
  activeColor,
  onClick,
}) => {
  const intl = useFormatMessage();

  return (
    <button
      onClick={onClick}
      type="button"
      className={cn(
        "relative grow overflow-hidden rounded-2xl transition-colors duration-200 bg-natural-200",
        "focus-visible:ring-secondary-600 focus-visible:ring-offset-2 focus-visible:outline-none focus-visible:ring-2",
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
        <Typography tag="p" className="text-body font-bold text-natural-50">
          {intl(PHONE_METHOD_TO_INTL_MSG_ID[method])}
        </Typography>
      </div>
    </button>
  );
};
