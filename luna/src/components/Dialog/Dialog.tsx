import React, { useCallback, useRef } from "react";
import { Button, ButtonSize, ButtonType } from "@/components/Button";
import { X } from "react-feather";
import cn from "classnames";

export const Dialog: React.FC<{
  children?: React.ReactNode;
  title: React.ReactElement | string;
  open?: boolean;
  close?: () => void;
  className?: string;
}> = ({ title, children, open, className, close }) => {
  const contentRef = useRef<HTMLDivElement>(null);

  const onClose = useCallback(
    (e: React.SyntheticEvent<HTMLDialogElement>) => {
      if (
        close &&
        contentRef.current &&
        e.target instanceof HTMLElement &&
        !contentRef.current.contains(e.target)
      )
        return close();
    },
    [close]
  );

  return (
    <dialog
      open={open}
      onClick={onClose}
      className={cn(
        "tw-fixed tw-inset-0 tw-w-screen tw-h-screen tw-bg-transparent tw-backdrop-blur-sm tw-p-6",
        "tw-hidden open:tw-flex tw-items-center tw-justify-center tw-z-[999]"
      )}
    >
      <div className="tw-relative tw-h-full tw-w-full">
        <div
          ref={contentRef}
          className={cn(
            "tw-bg-background-dialog tw-border tw-border-border-strong tw-rounded-md tw-px-5 tw-py-4 tw-shadow-lg",
            "tw-absolute tw-top-1/2 tw-left-1/2 -tw-translate-x-1/2 -tw-translate-y-1/2",
            className
          )}
        >
          <div className="tw-flex tw-justify-between tw-items-center tw-pb-4">
            <p className="tw-text-foreground tw-font-medium tw-text-base">
              {title}
            </p>

            <div>
              <Button
                onClick={close}
                size={ButtonSize.Tiny}
                type={ButtonType.Text}
                className="tw-w-[25px] tw-h-[25px] tw-flex tw-items-center tw-justify-center !tw-p-1"
              >
                <X className="tw-w-[20px] tw-h-[20px] tw-text-foreground" />
              </Button>
            </div>
          </div>
          <div>{children}</div>
        </div>
      </div>
    </dialog>
  );
};
