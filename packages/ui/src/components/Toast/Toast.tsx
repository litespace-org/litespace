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
        "py-3 px-4 font-cairo rounded-lg shadow-toast",
        "bg-natural-50 dark:bg-secondary-950",
        "relative overflow-hidden",
        "data-[state=open]:animate-slide-in",
        "flex gap-4",
        "relative  w-[calc(100vw-50px)] sm:w-[257px] md:w-[343px]",
        description ? "items-start" : "items-center"
      )}
    >
      <Close className="absolute top-4 left-4">
        <X className="w-4 h-4" />
      </Close>
      <div
        className={cn(
          "absolute top-0 right-0",
          "h-full w-1/2 translate-x-[calc(50%-2rem)]"
        )}
      />

      <div className="grow">
        <Title className="flex gap-2 items-center">
          <div
            className={cn(
              "rounded-full w-5 h-5 flex items-center justify-center shrink-0"
            )}
          >
            <Icon
              className={cn({
                "[&>*]:stroke-brand-600": type === "success",
                "[&>*>*]:stroke-destructive-600": type === "error",
                "[&>*>*]:stroke-secondary-600": type === "info",
              })}
            />
          </div>
          <Typography
            tag="span"
            className={cn("font-bold w-4/5 text-body text-natural-950")}
          >
            {title}
          </Typography>
        </Title>
        {description ? (
          <Description asChild>
            <Typography
              tag="p"
              className="text-natural-600 font-semibold dark:text-natural-50 text-caption"
            >
              {description}
            </Typography>
          </Description>
        ) : null}

        {!isEmpty(actions) ? (
          <div className="flex gap-4 mt-4">
            {actions?.map((action, idx) => (
              <Button
                key={idx}
                variant={action.variant || "tertiary"}
                className="flex-1"
                onClick={action.onClick}
                loading={action.loading}
                disabled={action.disabled}
                type={action.type || "main"}
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
      </div>
    </Root>
  );
};
