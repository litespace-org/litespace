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
import { useFormatMessage } from "@/hooks";
import { Typography } from "@/components/Typography";

export const ConfirmationDialog: React.FC<{
  trigger?: React.ReactNode;
  title: string;
  description: string;
  open?: boolean;
  setOpen?: (open: boolean) => void;
  actions?: {
    primary?: {
      label?: string;
      onClick?: Void;
      loading?: boolean;
      disabled?: boolean;
    };
    secondary?: {
      label?: string;
      onClick?: Void;
      loading?: boolean;
      disabled?: boolean;
    };
  };
  close: Void;
  type?: DialogType;
  icon: React.ReactNode;
}> = ({
  trigger,
  title,
  description,
  open,
  type = "success",
  icon,
  actions,
  close,
  setOpen,
}) => {
  const intl = useFormatMessage();

  return (
    <Root open={open} onOpenChange={setOpen}>
      {trigger ? <Trigger>{trigger}</Trigger> : null}
      <Portal>
        <Overlay
          onClick={close}
          className="tw-fixed tw-inset-0 tw-bg-transparent tw-backdrop-blur-sm tw-z-[98]"
        />
        <Content
          dir="rtl"
          className={cn(
            "tw-fixed tw-left-1/2 tw-top-1/2 -tw-translate-x-1/2 -tw-translate-y-1/2 tw-bg-natural-50",
            "tw-border tw-border-border-strong tw-rounded-xl tw-w-[328px] lg:tw-w-[400px] tw-shadow-lg tw-z-[98]",
            "tw-shadow-dialog-confirm tw-p-6"
          )}
        >
          <div className="tw-flex tw-items-center tw-justify-between tw-mb-4">
            <div
              className={cn(
                "tw-w-14 tw-h-14 tw-border-8 tw-rounded-full tw-flex tw-items-center tw-justify-center",
                {
                  "tw-bg-success-100 tw-border-success-50": type === "success",
                  "tw-bg-warning-100 tw-border-warning-50": type === "warning",
                  "tw-bg-destructive-100 tw-border-destructive-50":
                    type === "error",
                },
                {
                  "[&>svg>*]:tw-stroke-success-600": type === "success",
                  "[&>svg>*]:tw-stroke-warning-600": type === "warning",
                  "[&>svg>*]:tw-stroke-destructive-700": type === "error",
                }
              )}
            >
              {icon}
            </div>
            <Close
              onClick={close}
              className="tw-rounded-full tw-h-11 tw-w-11 tw-flex tw-items-center tw-justify-center"
            >
              <X className="tw-text-natural-600 tw-w-6 tw-h-6" />
            </Close>
          </div>
          <div className="tw-flex tw-gap-1 tw-flex-col tw-mb-6">
            <Title>
              <Typography
                element="body"
                weight="semibold"
                className="tw-text-natural-950 tw-mb-1"
              >
                {title}
              </Typography>
            </Title>
            <Typography
              element="caption"
              className="tw-text-natural-700"
              weight="regular"
            >
              {description}
            </Typography>
          </div>

          <div className="tw-flex tw-items-center tw-justify-center tw-gap-3">
            <Button
              className="tw-w-full"
              onClick={actions?.primary?.onClick}
              type={type !== "error" ? "main" : "error"}
              variant={"primary"}
              loading={actions?.primary?.loading}
              size="large"
              disabled={actions?.primary?.disabled}
            >
              {actions?.primary?.label || intl("labels.confirm")}
            </Button>
            {actions?.secondary ? (
              <Button
                onClick={actions?.secondary.onClick}
                className="tw-w-full"
                type={type !== "error" ? "main" : "error"}
                variant={"secondary"}
                size="large"
                loading={actions?.secondary.loading}
                disabled={actions?.secondary.disabled}
              >
                {actions?.secondary.label || intl("global.labels.cancel")}
              </Button>
            ) : null}
          </div>
        </Content>
      </Portal>
    </Root>
  );
};
