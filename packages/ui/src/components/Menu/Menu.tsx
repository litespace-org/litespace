import { Void } from "@litespace/types";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import cn from "classnames";
import More from "@litespace/assets/More";
import { Typography } from "@/components/Typography";
import React from "react";

export type MenuAction = {
  label: string;
  icon: React.ReactNode;
  onClick?: Void;
  disabled?: boolean;
};

export const Menu: React.FC<{
  actions: MenuAction[];
  children?: React.ReactNode;
  open?: boolean;
  setOpen?: (open: boolean) => void;
  title?: string;
  danger?: boolean;
}> = ({ actions, children, open, setOpen, title, danger }) => {
  return (
    <DropdownMenu.Root open={open} onOpenChange={setOpen}>
      <DropdownMenu.Trigger
        className={cn(
          "focus:tw-outline-none tw-h-6 tw-flex tw-items-center tw-justify-center",
          !children && "tw-p-2"
        )}
        type="button"
      >
        {children || <More className="[&>*]:tw-fill-natural-800" />}
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          side="top"
          className={cn(
            "tw-shadow-lesson-event-card tw-bg-natural-50 tw-p-1",
            "tw-flex tw-flex-col tw-gap-1 tw-rounded-lg tw-z-[5]"
          )}
        >
          {title ? (
            <Typography
              element="tiny-text"
              weight="semibold"
              className={cn(
                danger ? "tw-text-destructive-600" : "tw-text-natural-600",
                "tw-max-w-24"
              )}
            >
              {title}
            </Typography>
          ) : null}

          {actions.map(({ icon, label, onClick, disabled }) => (
            <DropdownMenu.Item
              key={label}
              disabled={disabled}
              className={cn(
                "tw-flex tw-flex-row tw-items-center tw-gap-2 tw-p-1 tw-pe-4 tw-rounded-lg",
                "hover:tw-bg-natural-100 active:tw-bg-brand-700 tw-cursor-pointer",
                "[&>span]:active:!tw-text-natural-50 [&>svg>*]:active:tw-stroke-natural-50",
                "focus:tw-outline-none focus:tw-bg-natural-100",
                disabled
              )}
              onClick={onClick}
            >
              <div className="tw-w-4 tw-h-4">{icon}</div>

              <Typography
                element="tiny-text"
                weight="semibold"
                className="tw-text-natural-600"
              >
                {label}
              </Typography>
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};
