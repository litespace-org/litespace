import React, { useMemo } from "react";
import { AlertCircle, AlertTriangle, CheckCircle, Info } from "react-feather";
import { AlertType } from "@/components/Alert/types";
import { Typography } from "@/components/Typography";
import cn from "classnames";

export const AlertV2: React.FC<{
  type: AlertType;
  title: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}> = ({ type, title, icon, action, className }) => {
  const {
    icon: customIcon,
    error,
    warning,
    success,
    info,
  } = useMemo(() => {
    return {
      icon,
      error: type === AlertType.Error && !icon,
      warning: type === AlertType.Warning && !icon,
      success: type === AlertType.Success && !icon,
      info: type === AlertType.Info && !icon,
    };
  }, [icon, type]);

  return (
    <div
      className={cn(
        "flex flex-wrap bg-natural-100 rounded-xl py-[13.5px] px-4 flex items-center gap-2",
        className
      )}
    >
      <div>
        {customIcon ? icon : null}
        {error ? <AlertCircle className="text-destructive-600" /> : null}
        {warning ? <AlertTriangle className="text-warning-600" /> : null}
        {success ? (
          <CheckCircle className="w-6 h-6 text-[var(--colors-green9)]" />
        ) : null}
        {info ? <Info className="text-natural-700" /> : null}
      </div>

      <div className="flex-1 flex justify-between items-center min-w-[150px]">
        {title ? (
          <Typography
            tag="p"
            className="text-tiny sm:text-body text-natural-700"
          >
            {title}
          </Typography>
        ) : null}
      </div>

      {action}
    </div>
  );
};

export default AlertV2;
