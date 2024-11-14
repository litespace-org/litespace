import React, { useMemo } from "react";
import { Root, Title, Description } from "@radix-ui/react-toast";
import cn from "classnames";
import { ToastType } from "@/components/Toast/types";
import CheckCircle from "@litespace/assets/check-circle.svg";
import Info from "@litespace/assets/info.svg";
import Cancel from "@litespace/assets/cancel.svg";
import { motion } from "framer-motion";
import { Typography } from "@/components/Typography";

const TOAST_DURATION = 4800;

const IconMap: Record<ToastType, React.FC<React.SVGProps<SVGSVGElement>>> = {
  error: Cancel,
  warning: Info,
  success: CheckCircle,
};

export const Toast: React.FC<{
  open?: boolean;
  title: string;
  type: ToastType;
  description?: string;
  onOpenChange?: (value: boolean) => void;
  toastKey?: number;
}> = ({ open, onOpenChange, title, description, toastKey, type }) => {
  const Icon = useMemo(() => IconMap[type], [type]);

  return (
    <Root
      dir="rtl"
      duration={TOAST_DURATION}
      open={open}
      key={toastKey}
      onOpenChange={onOpenChange}
      className={cn(
        "tw-py-3 tw-px-4 tw-font-cairo tw-rounded-lg tw-shadow-toast",
        "tw-bg-natural-50 dark:tw-bg-secondary-950",
        "tw-flex tw-gap-4 tw-items-center",
        "tw-relative tw-overflow-hidden",
        "data-[swipe=cancel]:tw-translate-x-0 data-[swipe=move]:tw-translate-x-[var(--radix-toast-swipe-move-x)] data-[state=closed]:tw-animate-hide data-[state=open]:tw-animate-slide-in data-[swipe=end]:tw-animate-swipe-out data-[swipe=cancel]:tw-transition-[transform_200ms_ease-out]",
        "tw-relative"
      )}
    >
      <div
        className={cn(
          "tw-bg-toast-success tw-absolute tw-top-0 tw-right-0",
          "tw-h-full tw-w-1/2  tw-translate-x-[calc(50%-2rem)]",
          {
            "tw-bg-toast-success": type === "success",
            "tw-bg-toast-warning": type === "warning",
            "tw-bg-toast-error": type === "error",
          }
        )}
      />

      <div
        className={cn(
          "tw-rounded-full tw-w-8 tw-h-8 tw-flex tw-items-center tw-justify-center",
          {
            "tw-bg-success-900": type === "success",
            "tw-bg-warning-900": type === "warning",
            "tw-bg-destructive-900": type === "error",
          }
        )}
      >
        <Icon className="tw-w-6 tw-h-6" />
      </div>
      <div className="tw-grow">
        <Title
          className={cn("tw-font-bold tw-w-4/5 dark:tw-text-natural-50", {
            "tw-text-success-700": type === "success",
            "tw-text-warning-700": type === "warning",
            "tw-text-destructive-700": type === "error",
          })}
        >
          {title}
        </Title>
        {description ? (
          <Description asChild>
            <Typography
              element="caption"
              className="tw-text-natural-600 tw-font-semibold dark:tw-text-natural-50"
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
          "tw-absolute -tw-bottom-[7px] tw-left-0",
          "tw-blur-[4px]",
          "tw-h-[14px] tw-rounded-[10px]",
          {
            "tw-bg-success-500": type === "success",
            "tw-bg-warning-500": type === "warning",
            "tw-bg-destructive-500": type === "error",
          }
        )}
      />

      <motion.div
        initial={{ width: "100%" }}
        animate={{ width: "0%" }}
        transition={{ duration: TOAST_DURATION / 1000 }}
        className={cn(
          "tw-absolute -tw-bottom-[7px] tw-left-0",
          "tw-h-[14px] tw-rounded-[10px]",
          {
            "tw-bg-success-500": type === "success",
            "tw-bg-warning-500": type === "warning",
            "tw-bg-destructive-500": type === "error",
          }
        )}
      />
    </Root>
  );
};
