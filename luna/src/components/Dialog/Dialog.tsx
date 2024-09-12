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
        "fixed inset-0 w-screen h-screen flex items-center justify-center",
        "bg-transparent backdrop-blur-sm shadow-lg p-6 hidden open:block z-[999]"
      )}
    >
      <div className="relative h-full w-full">
        <div
          ref={contentRef}
          className={cn(
            "bg-background-dialog border border-border-strong rounded-md px-5 py-4 shadow-lg",
            "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
            className
          )}
        >
          <div className="flex justify-between items-center pb-4">
            <p className="text-foreground font-medium text-base">{title}</p>

            <div>
              <Button
                onClick={close}
                size={ButtonSize.Tiny}
                type={ButtonType.Text}
                className="w-[25px] h-[25px] flex items-center justify-center !p-1"
              >
                <X className="w-[20px] h-[20px] text-foreground" />
              </Button>
            </div>
          </div>
          <div>{children}</div>
        </div>
      </div>
    </dialog>
  );
};
