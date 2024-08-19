import React, { useCallback, useRef } from "react";
import { X } from "react-feather";
import { Button, ButtonSize, ButtonType } from "../Button";

export const Dialog: React.FC<{
  children?: React.ReactNode;
  title: React.ReactElement | string;
  trigger?: React.ReactElement;
}> = ({ trigger, title, children }) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const toggle = useCallback(() => {
    if (!dialogRef.current) return;
    if (dialogRef.current.hasAttribute("open")) dialogRef.current.close();
    else dialogRef.current.show();
  }, []);

  const onClose = useCallback(
    (e: React.SyntheticEvent<HTMLDialogElement>) => {
      if (!contentRef.current) return;
      if (
        contentRef.current &&
        e.target instanceof HTMLElement &&
        !contentRef.current.contains(e.target)
      )
        return toggle();
    },
    [toggle]
  );

  return (
    <>
      <div onClick={toggle}>{trigger}</div>
      <dialog
        ref={dialogRef}
        onClick={onClose}
        className="open:inset-0 open:w-full open:h-full open:flex open:items-center open:justify-center open:backdrop-blur-sm open:bg-transparent"
      >
        <div
          ref={contentRef}
          className="bg-surface-100  border border-border-strong rounded-md px-5 py-4 min-w-[500px]"
        >
          <div className="flex justify-between items-center pb-4">
            <p className="text-foreground font-medium text-base">{title}</p>

            <div>
              <Button
                onClick={toggle}
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
