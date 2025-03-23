import React, { useMemo } from "react";
import { Root, Title, Description } from "@radix-ui/react-toast";
import cn from "classnames";
import { ToastId, ToastType } from "@/components/Toast/types";
import Check from "@litespace/assets/CheckCircleFill";
import Warning from "@litespace/assets/WarningFill";
import XErrored from "@litespace/assets/XErroredFill";
import { motion } from "framer-motion";
import { Typography } from "@/components/Typography";

const TOAST_DURATION = 10_000;

const IconMap: Record<
  ToastType,
  React.MemoExoticComponent<
    (props: React.SVGProps<SVGSVGElement>) => React.JSX.Element
  >
> = {
  error: XErrored,
  warning: Warning,
  success: Check,
};

export const Toast: React.FC<{
  open?: boolean;
  title: React.ReactNode;
  type: ToastType;
  description?: React.ReactNode;
  onOpenChange?: (value: boolean) => void;
  toastId?: ToastId;
}> = ({ open, onOpenChange, title, description, toastId, type }) => {
  const Icon = useMemo(() => IconMap[type], [type]);

  return (
    <Root
      dir="rtl"
      duration={TOAST_DURATION}
      open={open}
      key={toastId}
      onOpenChange={onOpenChange}
      className={cn(
        "py-3 px-4 font-cairo rounded-lg shadow-toast",
        "bg-natural-50 dark:bg-secondary-950",
        "relative overflow-hidden",
        "data-[swipe=cancel]:translate-x-0 data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[state=closed]:animate-hide data-[state=open]:animate-slide-in data-[swipe=end]:animate-swipe-out data-[swipe=cancel]:transition-[transform_200ms_ease-out]",
        "flex gap-4",
        "relative w-[257px] md:w-[343px]",
        description ? "items-start" : "items-center"
      )}
    >
      <div
        className={cn(
          "absolute top-0 right-0",
          "h-full w-1/2 translate-x-[calc(50%-2rem)]",
          {
            "bg-toast-success": type === "success",
            "bg-toast-warning": type === "warning",
            "bg-toast-error": type === "error",
          }
        )}
      />

      <div
        className={cn(
          "rounded-full w-8 h-8 flex items-center justify-center shrink-0",
          {
            "bg-success-900": type === "success",
            "bg-warning-900": type === "warning",
            "bg-destructive-900": type === "error",
          }
        )}
      >
        <Icon />
      </div>
      <div className="grow">
        <Title asChild>
          <Typography
            tag="span"
            className={cn("font-bold w-4/5 text-body", {
              "text-success-700": type === "success",
              "text-warning-700": type === "warning",
              "text-destructive-700": type === "error",
            })}
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
      </div>

      <motion.div
        initial={{ width: "100%" }}
        animate={{ width: "0%" }}
        transition={{ duration: TOAST_DURATION / 1000 }}
        className={cn(
          "absolute -bottom-[7px] left-0",
          "blur-[4px]",
          "h-[14px] rounded-[10px]",
          {
            "bg-success-500": type === "success",
            "bg-warning-500": type === "warning",
            "bg-destructive-500": type === "error",
          }
        )}
      />

      <motion.div
        initial={{ width: "100%" }}
        animate={{ width: "0%" }}
        transition={{ duration: TOAST_DURATION / 1000 }}
        className={cn(
          "absolute -bottom-[7px] left-0",
          "h-[14px] rounded-[10px]",
          {
            "bg-success-500": type === "success",
            "bg-warning-500": type === "warning",
            "bg-destructive-500": type === "error",
          }
        )}
      />
    </Root>
  );
};
