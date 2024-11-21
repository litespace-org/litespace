import * as RadixDialog from "@radix-ui/react-dialog";
import cn from "classnames";
import React from "react";
import { Cross2Icon } from "@radix-ui/react-icons";
import { DialogType } from "@/components/ConfirmationDialog/types";
import CheckCircle from "@litespace/assets/CheckCircle";
import Save from "@litespace/assets/Save";
import EndCall from "@litespace/assets/EndCall";
import { Button, ButtonType, ButtonVariant } from "../Button";
import { Void } from "@litespace/types";
import { useFormatMessage } from "@/hooks";

const IconMap: Record<
  DialogType,
  React.MemoExoticComponent<
    (props: React.SVGProps<SVGSVGElement>) => React.JSX.Element
  >
> = {
  save: Save,
  endCall: EndCall,
  success: CheckCircle,
};

export const ConfirmationDialog: React.FC<{
  trigger?: React.ReactNode;
  title: React.ReactNode;
  description?: string;
  open?: boolean;
  className?: string;
  setOpen?: (open: boolean) => void;
  confirm: Void;
  close: Void;
  type: DialogType;
}> = ({
  trigger,
  title,
  description,
  className,
  close,
  open,
  setOpen,
  type,
  confirm,
}) => {
  const intl = useFormatMessage();
  const Icon = IconMap[type];
  return (
    <RadixDialog.Root open={open} onOpenChange={setOpen}>
      {trigger ? <RadixDialog.Trigger>{trigger}</RadixDialog.Trigger> : null}
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="tw-fixed tw-inset-0 tw-bg-transparent tw-backdrop-blur-sm" />
        <RadixDialog.Content
          className={cn(
            "tw-fixed tw-left-1/2 tw-top-1/2 -tw-translate-x-1/2 -tw-translate-y-1/2 tw-bg-natural-50",
            "tw-border tw-border-border-strong tw-rounded-xl tw-p-6 tw-w-[400px] tw-shadow-lg tw-min-w-96",
            "tw-shadow-dialog-success",
            className
          )}
        >
          <div className="tw-flex tw-justify-between tw-mb-4">
            <div
              className={cn(
                "tw-rounded-full tw-w-12 tw-h-12 tw-border-8 tw-flex tw-items-center tw-justify-center",
                {
                  "tw-bg-success-100 tw-border-success-50": type === "success",
                  "tw-bg-warning-100 tw-border-warning-50": type === "save",
                  "tw-bg-destructive-100 tw-border-destructive-50":
                    type === "endCall",
                }
              )}
            >
              <Icon
                className={cn("tw-w-6 tw-h-6", {
                  "[&>*]:tw-stroke-success-600": type === "success",
                  "[&>*]:tw-stroke-warning-600": type === "save",
                  "[&>*]:tw-stroke-destructive-700": type === "endCall",
                })}
              />
            </div>
            <RadixDialog.Close onClick={close} className="tw-rounded-full">
              <Cross2Icon className="tw-cursor-pointer tw-w-6 tw-h-6 tw-p-0.5 tw-text-natural-600" />
            </RadixDialog.Close>
          </div>
          <div className="tw-mb-8">
            <RadixDialog.Title className="tw-font-semibold tw-text-natural-950">
              {title}
            </RadixDialog.Title>
            {description ? (
              <RadixDialog.Description className="tw-mb-4 tw-text-sm tw-text-natural-700">
                {description}
              </RadixDialog.Description>
            ) : null}
          </div>

          <div className="tw-flex tw-items-center tw-justify-center tw-gap-3">
            <Button
              onClick={close}
              className="tw-border-natural-500 tw-px-6 tw-py-3 !tw-w-[170px] tw-text-natural-700 tw-font-semibold"
              type={ButtonType.Main}
              variant={ButtonVariant.Secondary}
            >
              {intl("global.labels.cancel")}{" "}
            </Button>
            <Button
              className="tw-px-6 tw-py-3 tw-font-semibold !tw-w-[170px]"
              onClick={confirm}
              type={type !== "endCall" ? ButtonType.Main : ButtonType.Error}
              variant={ButtonVariant.Primary}
            >
              {type !== "endCall"
                ? intl("global.labels.confirm")
                : intl("call.leave")}{" "}
            </Button>
          </div>
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
};
