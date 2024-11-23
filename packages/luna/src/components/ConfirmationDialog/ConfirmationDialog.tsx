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
import { Button, ButtonType, ButtonVariant } from "@/components/Button";
import { Void } from "@litespace/types";
import { useFormatMessage } from "@/hooks";
import { Typography } from "@/components/Typography";

export const ConfirmationDialog: React.FC<{
  trigger?: React.ReactNode;
  title: string;
  description: string;
  open?: boolean;
  setOpen?: (open: boolean) => void;
  confirm: Void;
  close: Void;
  type?: DialogType;
  Icon: typeof X;
}> = ({
  trigger,
  title,
  description,
  open,
  type = "success",
  Icon,
  close,
  setOpen,
  confirm,
}) => {
  const intl = useFormatMessage();

  return (
    <Root open={open} onOpenChange={setOpen}>
      {trigger ? <Trigger>{trigger}</Trigger> : null}
      <Portal>
        <Overlay className="tw-fixed tw-inset-0 tw-bg-transparent tw-backdrop-blur-sm" />
        <Content
          dir="rtl"
          className={cn(
            "tw-fixed tw-left-1/2 tw-top-1/2 -tw-translate-x-1/2 -tw-translate-y-1/2 tw-bg-natural-50",
            "tw-border tw-border-border-strong tw-rounded-xl tw-w-[400px] tw-shadow-lg tw-min-w-96",
            "tw-shadow-dialog-confirm"
          )}
        >
          <div className="tw-pl-6 tw-pr-4 tw-pt-4">
            <div className="tw-flex tw-justify-between tw-mb-4">
              <div
                className={cn(
                  "tw-w-12 tw-h-12 tw-border-8 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-mt-2",
                  {
                    "tw-bg-success-100 tw-border-success-50":
                      type === "success",
                    "tw-bg-warning-100 tw-border-warning-50":
                      type === "warning",
                    "tw-bg-destructive-100 tw-border-destructive-50":
                      type === "error",
                  }
                )}
              >
                <Icon
                  className={cn({
                    "[&>*]:tw-stroke-success-600": type === "success",
                    "[&>*]:tw-stroke-warning-600": type === "warning",
                    "[&>*]:tw-stroke-destructive-700": type === "error",
                  })}
                />
              </div>
              <Close
                onClick={close}
                className="tw-rounded-full tw-h-11 tw-w-11 tw-flex tw-items-center tw-justify-center"
              >
                <X className="tw-text-natural-600" />
              </Close>
            </div>
            <div>
              <Typography
                element="body"
                weight="semibold"
                className="tw-text-natural-950 tw-mb-1"
              >
                {title}
              </Typography>
              <Typography
                element="caption"
                className="tw-text-natural-750"
                weight="regular"
              >
                {description}
              </Typography>
            </div>
          </div>

          <div className="tw-flex tw-items-center tw-justify-center tw-gap-3 tw-pt-8 tw-pb-6 tw-px-6">
            <Button
              onClick={close}
              className="tw-w-full"
              type={type !== "error" ? ButtonType.Main : ButtonType.Error}
              variant={ButtonVariant.Secondary}
            >
              {intl("global.labels.cancel")}
            </Button>
            <Button
              className="tw-w-full"
              onClick={confirm}
              type={type !== "error" ? ButtonType.Main : ButtonType.Error}
              variant={ButtonVariant.Primary}
            >
              {intl("global.labels.confirm")}
            </Button>
          </div>
        </Content>
      </Portal>
    </Root>
  );
};