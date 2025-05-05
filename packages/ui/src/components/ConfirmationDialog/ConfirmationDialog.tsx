import {
  Root,
  Trigger,
  Close,
  Overlay,
  Content,
  Portal,
  Title,
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
import Spinner from "@litespace/assets/Spinner";

const Progress: React.FC<{
  value: number;
  label: string;
  type: DialogType;
}> = ({ value, label, type }) => {
  return (
    <div>
      <div className="flex flex-row gap-2 items-center">
        <Typography tag="span" className="text-natural-950 text-body font-bold">
          {formatPercentage(value)}
        </Typography>

        <Typography tag="span" className="text-natural-500 text-tiny">
          {label}
        </Typography>
      </div>

      <div className="w-full h-2 bg-natural-100 rounded-full">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.3 }}
          className={cn("h-full rounded-full", {
            "bg-brand-700": type === "main" || type === "success",
            "bg-destructive-700": type === "error",
            "bg-warning-700": type === "warning",
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
  actions?: {
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
  close?: Void;
  closable?: boolean;
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
  closable = true,
}) => {
  return (
    <Root open={open}>
      {trigger ? <Trigger>{trigger}</Trigger> : null}
      <Portal>
        <Overlay
          onClick={closable ? close : undefined}
          className="fixed inset-0 backdrop-blur-[15px] bg-overlay-dialog z-dialog-overlay"
        />
        <Title className="hidden">{title}</Title>
        <Content
          dir="rtl"
          className={cn(
            "fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-natural-50",
            "border border-border-strong rounded-xl w-[328px] lg:w-[400px] shadow-lg z-[98]",
            "shadow-dialog-confirm p-6"
          )}
        >
          <div className="flex items-center justify-between mb-4">
            <div
              className={cn(
                "w-12 h-12 border-8 rounded-full flex items-center justify-center",
                {
                  "bg-brand-100 border-brand-50": type === "main",
                  "bg-success-100 border-success-50": type === "success",
                  "bg-warning-100 border-warning-50": type === "warning",
                  "bg-destructive-100 border-destructive-50": type === "error",
                },
                {
                  "[&_svg>*]:stroke-brand-700": type === "main",
                  "[&_svg>*]:stroke-success-600": type === "success",
                  "[&_svg>*]:stroke-warning-600": type === "warning",
                  "[&_svg>*]:stroke-destructive-700": type === "error",
                }
              )}
            >
              <div className="w-6 h-6">{icon}</div>
            </div>
            <Close
              onClick={close}
              disabled={!closable}
              className={cn(
                "rounded-full h-11 w-11 flex items-center justify-center",
                { "cursor-not-allowed opacity-50": !closable }
              )}
            >
              <X className="text-natural-600 w-4 h-4 lg:w-6 lg:h-6" />
            </Close>
          </div>

          <div className="flex gap-4">
            <Title>
              <Typography
                tag="span"
                className="text-natural-950 font-semibold text-body"
              >
                {title}
              </Typography>
            </Title>
            {actions?.primary.loading || actions?.secondary?.loading ? (
              <Spinner className="w-spinner-x" />
            ) : null}
          </div>

          {description || progress ? (
            <div className="flex gap-1 flex-col mt-1">
              {description ? (
                <Typography
                  tag="p"
                  className="text-natural-700 text-caption font-normal"
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
          ) : null}

          {actions ? (
            <div className="flex items-center justify-center gap-3 mt-4 lg:mt-6">
              <Button
                type={type}
                size="large"
                variant="primary"
                className="w-full"
                onClick={actions.primary.onClick}
                disabled={actions.primary.disabled}
              >
                {actions.primary.label}
              </Button>

              {actions.secondary ? (
                <Button
                  size="large"
                  type={type}
                  variant="secondary"
                  className="w-full"
                  onClick={actions.secondary.onClick}
                  disabled={actions.secondary.disabled}
                >
                  {actions.secondary.label}
                </Button>
              ) : null}
            </div>
          ) : null}
        </Content>
      </Portal>
    </Root>
  );
};
