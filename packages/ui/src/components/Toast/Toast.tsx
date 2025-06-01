import { Button } from "@/components/Button";
import { ToastAction } from "@/components/Toast/context";
import { ToastId, ToastType } from "@/components/Toast/types";
import { Typography } from "@/components/Typography";
import AlertCircle from "@litespace/assets/AlertCircle";
import CheckCircle from "@litespace/assets/CheckCircle";
import Error from "@litespace/assets/Error";
import WarningInfo from "@litespace/assets/WarningInfo";
import X from "@litespace/assets/X";
import { Close, Description, Root, Title } from "@radix-ui/react-toast";
import cn from "classnames";
import { isEmpty } from "lodash";
import React, { useMemo } from "react";

const TOAST_DURATION = 4_000;

const IconMap: Record<
  ToastType,
  React.MemoExoticComponent<
    (props: React.SVGProps<SVGSVGElement>) => React.JSX.Element
  >
> = {
  error: Error,
  info: AlertCircle,
  warning: WarningInfo,
  success: CheckCircle,
};

export const Toast: React.FC<{
  open?: boolean;
  title: React.ReactNode;
  type: ToastType;
  description?: React.ReactNode;
  onOpenChange?: (value: boolean) => void;
  toastId?: ToastId;
  actions?: Array<ToastAction>;
}> = ({ open, onOpenChange, title, description, toastId, type, actions }) => {
  const Icon = useMemo(() => IconMap[type], [type]);
  return (
    <Root
      dir="rtl"
      duration={TOAST_DURATION}
      open={open}
      key={toastId}
      onOpenChange={onOpenChange}
      onSwipeEnd={(e) => e.preventDefault()}
      className={cn(
        "p-4 font-cairo rounded-lg shadow-toast overflow-hidden",
        "border border-natural-100",
        "bg-natural-50 dark:bg-secondary-950",
        "data-[state=open]:animate-slide-in",
        "flex flex-col",
        "w-[calc(100vw-32px)] sm:w-[250px] md:w-[350px]",
        "focus:outline-none focus-visible:ring focus:ring-2 focus:ring-secondary-600",
        description ? "items-start" : "items-center"
      )}
    >
      <Title className="flex gap-2 items-center justify-center w-full">
        <Typography
          tag="span"
          className={cn(
            "font-bold flex-1 text-body text-natural-950 select-text relative"
          )}
          style={{ textIndent: "28px" }}
        >
          <Icon
            className={cn("w-5 h-5 absolute top-0.5", {
              "[&>*]:stroke-brand-600": type === "success",
              "[&>*>*]:stroke-destructive-600": type === "error",
              "[&>*>*]:stroke-secondary-600": type === "info",
            })}
          />

          {title}
        </Typography>

        <Close
          className={cn(
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary-600 rounded-sm",
            "self-start py-1"
          )}
        >
          <X className="w-4 h-4 [&>*]:stroke-natural-600" />
        </Close>
      </Title>

      <Description
        data-show={!!description}
        className="hidden data-[show=true]:block mt-2"
      >
        <Typography
          tag="p"
          className="text-natural-600 font-semibold dark:text-natural-50 text-caption select-text"
        >
          {description}
        </Typography>
      </Description>

      {actions && !isEmpty(actions) ? (
        <div className="flex flex-row items-center justify-normal gap-2 w-full mt-4">
          {actions.map((action, idx) => (
            <Button
              key={idx}
              variant="primary"
              type="natural"
              loading={action.loading}
              disabled={action.disabled}
              onClick={() => {
                const shouldClose = action.onClick?.();
                if (shouldClose) onOpenChange?.(false);
              }}
              className="min-w-20"
            >
              <Typography
                tag="span"
                className="text-natural-700 text-body font-medium"
              >
                {action.label}
              </Typography>
            </Button>
          ))}
        </div>
      ) : null}
    </Root>
  );
};
