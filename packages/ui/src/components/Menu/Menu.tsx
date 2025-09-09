import { Void } from "@litespace/types";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import cn from "classnames";
import More from "@litespace/assets/More";
import { Typography } from "@/components/Typography";
import React from "react";

export type MenuAction = {
  label: string;
  icon?: React.ReactNode;
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
  className?: string;
}> = ({ actions, children, open, setOpen, title, danger, className }) => {
  return (
    <DropdownMenu.Root open={open} onOpenChange={setOpen}>
      <DropdownMenu.Trigger
        className={cn(
          "focus:outline-none h-6 flex items-center justify-center",
          !children && "p-2"
        )}
        type="button"
      >
        {children || <More className="[&>*]:fill-natural-800 w-4 h-1" />}
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          side="top"
          className={cn(
            "shadow-lesson-event-card bg-natural-50 p-1",
            "flex flex-col gap-1 rounded-lg min-w-[121px] z-20",
            className
          )}
        >
          {title ? (
            <Typography
              tag="p"
              className={cn(
                "text-tiny font-semibold",
                danger ? "text-destructive-600" : "text-natural-600",
                "max-w-24"
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
                "flex flex-row items-center gap-2 p-1 pe-4 rounded-lg",
                "hover:bg-natural-100 active:bg-brand-700 cursor-pointer",
                "[&>span]:active:!text-natural-50 [&>div>svg>*]:active:stroke-natural-50",
                "focus:outline-none focus:bg-natural-100",
                disabled
              )}
              onClick={onClick}
            >
              {icon ? <div className="w-4 h-4">{icon}</div> : null}

              <Typography
                tag="span"
                className="text-natural-600 text-tiny font-semibold"
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
