import {
  Root,
  Trigger,
  Close,
  Overlay,
  Content,
  Portal,
} from "@radix-ui/react-dialog";
import cn from "classnames";
import React from "react";
import { DialogType } from "@/components/ConfirmationDialog/types";
import X from "@litespace/assets/X";
import { Button } from "@/components/Button";
import { Void } from "@litespace/types";
import { Typography } from "@/components/Typography";
import { formatPercentage } from "@/components/utils";
import { motion } from "framer-motion";

const Progress: React.FC<{
  value: number;
  label: string;
  type: DialogType;
}> = ({ value, label, type }) => {
  return (
    <div>
      <div className="tw-flex tw-flex-row tw-gap-2 tw-items-center">
        <Typography
          tag="span"
          className="tw-text-natural-950 tw-text-body tw-font-bold"
        >
          {formatPercentage(value)}
        </Typography>

        <Typography tag="span" className="tw-text-natural-500 tw-text-tiny">
          {label}
        </Typography>
      </div>

      <div className="tw-w-full tw-h-2 tw-bg-natural-100 tw-rounded-full">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.3 }}
          className={cn("tw-h-full tw-rounded-full", {
            "tw-bg-brand-700": type === "main" || type === "success",
            "tw-bg-destructive-700": type === "error",
            "tw-bg-warning-700": type === "warning",
          })}
        />
      </div>
    </div>
  );
};

export const ConfirmationDialog: React.FC<{
  trigger?: React.ReactNode;
  title: string;
  description?: string;
  open?: boolean;
  progress?: {
    /**
     * The progress value should be between 0 and 100 (inclusive)
     */
    value: number;
    label: string;
  };
  actions: {
    primary: {
      label: string;
      onClick?: Void;
      loading?: boolean;
      disabled?: boolean;
    };
    secondary?: {
      label: string;
      onClick?: Void;
      loading?: boolean;
      disabled?: boolean;
    };
  };
  close: Void;
  type?: DialogType;
  icon: React.ReactNode;
}> = ({
  type = "main",
  description,
  trigger,
  title,
  open,
  icon,
  actions,
  progress,
  close,
}) => {
  return (
    <Root open={open}>
      {trigger ? <Trigger>{trigger}</Trigger> : null}
      <Portal>
        <Overlay
          onClick={close}
          className="tw-fixed tw-inset-0 tw-backdrop-blur-[15px] tw-bg-overlay-dialog tw-z-dialog-overlay"
        />
        <Content
          dir="rtl"
          className={cn(
            "tw-fixed tw-left-1/2 tw-top-1/2 -tw-translate-x-1/2 -tw-translate-y-1/2 tw-bg-natural-50",
            "tw-border tw-border-border-strong tw-rounded-xl tw-w-[328px] lg:tw-w-[400px] tw-shadow-lg tw-z-[98]",
            "tw-shadow-dialog-confirm tw-p-6"
          )}
        >
          <div className="tw-flex tw-items-center tw-justify-between tw-mb-4 lg:tw-mb-6">
            <div
              className={cn(
                "tw-w-12 tw-h-12 tw-border-8 tw-rounded-full tw-flex tw-items-center tw-justify-center",
                {
                  "tw-bg-brand-100 tw-border-brand-50": type === "main",
                  "tw-bg-success-100 tw-border-success-50": type === "success",
                  "tw-bg-warning-100 tw-border-warning-50": type === "warning",
                  "tw-bg-destructive-100 tw-border-destructive-50":
                    type === "error",
                },
                {
                  "[&_svg>*]:tw-stroke-brand-700": type === "main",
                  "[&_svg>*]:tw-stroke-success-600": type === "success",
                  "[&_svg>*]:tw-stroke-warning-600": type === "warning",
                  "[&_svg>*]:tw-stroke-destructive-700": type === "error",
                }
              )}
            >
              <div className="tw-w-6 tw-h-6">{icon}</div>
            </div>
            <Close
              onClick={close}
              className="tw-rounded-full tw-h-11 tw-w-11 tw-flex tw-items-center tw-justify-center"
            >
              <X className="tw-text-natural-600 tw-w-6 tw-h-6" />
            </Close>
          </div>
          <div className="tw-flex tw-gap-1 tw-flex-col tw-mb-4 lg:tw-mb-6">
            <Typography
              tag="h2"
              className="tw-text-natural-950 tw-mb-1 tw-font-semibold tw-text-body"
            >
              {title}
            </Typography>
            {description ? (
              <Typography
                tag="p"
                className="tw-text-natural-700 tw-text-caption tw-font-regular"
              >
                {description}
              </Typography>
            ) : null}

            {progress ? (
              <Progress
                value={progress.value}
                label={progress.label}
                type={type}
              />
            ) : null}
          </div>

          <div className="tw-flex tw-items-center tw-justify-center tw-gap-3">
            <Button
              type={type}
              size="large"
              variant="primary"
              className="tw-w-full"
              onClick={actions.primary.onClick}
              loading={actions.primary.loading}
              disabled={actions.primary.disabled}
            >
              {actions.primary.label}
            </Button>

            {actions.secondary ? (
              <Button
                size="large"
                type={type}
                variant="secondary"
                className="tw-w-full"
                onClick={actions.secondary.onClick}
                loading={actions.secondary.loading}
                disabled={actions.secondary.disabled}
              >
                {actions.secondary.label}
              </Button>
            ) : null}
          </div>
        </Content>
      </Portal>
    </Root>
  );
};
