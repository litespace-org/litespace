import React, { useCallback, useRef } from "react";
import { Button, ButtonSize, ButtonType } from "@/components/Button";
import { X } from "react-feather";
import cn from "classnames";

export const Dialog: React.FC<{
  children?: React.ReactNode;
  title: React.ReactElement | string;
  trigger?: React.ReactElement;
  open?: boolean;
  close?: () => void;
  className?: string;
}> = ({ trigger, title, children, open, className, close }) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const onClose = useCallback(
    (e: React.SyntheticEvent<HTMLDialogElement>) => {
      if (!contentRef.current) return;
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
    <>
      {trigger ? <div>{trigger}</div> : null}
      <dialog
        open={open}
        ref={dialogRef}
        onClick={onClose}
        className="open:inset-0 open:w-full open:h-full open:flex open:items-center open:justify-center open:backdrop-blur-sm open:bg-transparent z-50"
      >
        <div
          ref={contentRef}
          className={cn(
            "bg-background-dialog border border-border-strong rounded-md px-5 py-4 min-w-[500px]",
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
                <X className="w-[20px] h-[20px]" />
              </Button>
            </div>
          </div>
          <div>{children}</div>
        </div>
      </dialog>
    </>
  );
};
