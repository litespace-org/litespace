import * as DialogComponent from "@radix-ui/react-dialog";
import cn from "classnames";
import React from "react";
import { X } from "react-feather";

export const Dialog: React.FC<{
  trigger: React.ReactNode;
  title: React.ReactNode;
  children?: React.ReactNode;
  description?: string;
  open?: boolean;
  className?: string;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  close?: () => void;
}> = ({ trigger, title, children, description, className, open, setOpen }) => {
  return (
    <DialogComponent.Root open={open} onOpenChange={setOpen}>
      <DialogComponent.Trigger>{trigger}</DialogComponent.Trigger>
      <DialogComponent.Portal>
        <DialogComponent.Overlay className="tw-fixed tw-inset-0 tw-bg-black/50" />
        <DialogComponent.Content
          className={cn(
            "tw-fixed tw-left-1/2 tw-top-1/2 -tw-translate-x-1/2 -tw-translate-y-1/2 tw-bg-black",
            "tw-rounded-md tw-border tw-border-neutral-50tw-border tw-border-border-strong tw-px-5 tw-py-4",
            className
          )}
        >
          <div className="tw-flex tw-justify-between mb-4">
            <DialogComponent.Title>{title}</DialogComponent.Title>
            <DialogComponent.Close>
              <X className="hover:tw-cursor-pointer" />
            </DialogComponent.Close>
          </div>
          <DialogComponent.Description>
            {description}
          </DialogComponent.Description>
          {children}
        </DialogComponent.Content>
      </DialogComponent.Portal>
    </DialogComponent.Root>
  );
};
