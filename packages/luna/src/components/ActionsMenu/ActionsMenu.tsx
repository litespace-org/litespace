import React, { useCallback, useEffect, useRef, useState } from "react";
import { MoreVertical } from "react-feather";
import { Button, ButtonSize, ButtonType } from "@/components/Button";
import { MenuAction } from "@/components/ActionsMenu/types";
import cn from "classnames";
import {
  Root,
  Trigger,
  Portal,
  Content,
  Item,
} from "@radix-ui/react-dropdown-menu";

type Placement = "top" | "bottom";

export const ActionsMenu: React.FC<{
  actions: MenuAction[];
  placement?: Placement;
  children?: React.ReactNode;
  onToggle?: (open: boolean) => void;
  disabled?: boolean;
}> = ({ actions, children, placement = "bottom", disabled, onToggle }) => {
  const [open, setOpen] = useState<boolean>(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const hide = useCallback(() => {
    setOpen(false);
    if (onToggle) onToggle(false);
  }, [onToggle]);

  const toggle = useCallback(() => {
    const next = !open;
    setOpen(next);
    if (onToggle) onToggle(next);
  }, [onToggle, open]);

  const onClickOutside = useCallback(
    (event: MouseEvent) => {
      if (
        event.target instanceof HTMLElement &&
        menuRef.current &&
        !menuRef.current.contains(event.target)
      )
        hide();
    },
    [hide]
  );

  useEffect(() => {
    document.addEventListener("click", onClickOutside);
    return () => document.removeEventListener("click", onClickOutside);
  }, [onClickOutside]);

  return (
    <Root dir="rtl">
      <Trigger disabled={disabled} asChild>
        {children || (
          <button
            disabled={disabled}
            className={cn(
              "tw-text-center tw-font-normal tw-transition-all tw-ease-out tw-duration-200",
              "tw-w-9 tw-h-9 tw-rounded-full tw-flex tw-items-center tw-justify-center",
              "disabled:tw-opacity-50 disabled:tw-cursor-not-allowed",
              "tw-outline-none tw-transition-all tw-outline-0 focus-visible:tw-outline-2 focus-visible:tw-outline-offset-1",
              "tw-bg-background-alternative hover:tw-bg-background-selection dark:tw-bg-muted",
              "tw-border tw-border-border-strong hover:tw-border-border-stronger focus-visible:tw-outline-brand-600 tw-text-foreground"
            )}
          >
            <MoreVertical className="tw-w-5 tw-h-5" />
          </button>
        )}
      </Trigger>

      <Portal>
        <Content
          className={cn(
            "tw-min-w-56 tw-bg-background-overlay tw-border tw-border-border-overlay tw-rounded-md tw-p-[5px]"
          )}
          sideOffset={5}
        >
          {actions.map((action) => (
            <Item
              key={action.id}
              className={cn(
                "tw-px-2.5 tw-py-1.5 tw-h-[30px] tw-text-sm !tw-leading-none tw-cursor-pointer",
                "tw-ontline-none hover:tw-outline-background-selection",
                action.danger && "twtext-destructive-600"
              )}
            >
              {action.label}
            </Item>
          ))}
        </Content>
      </Portal>
    </Root>
    // <div className="tw-relative tw-w-fit" ref={menuRef}>
    //   {children ? (
    //     <div onClick={toggle} className="tw-cursor-pointer">
    //       {children}
    //     </div>
    //   ) : (
    //     <Button
    //       onClick={toggle}
    //       size={ButtonSize.Tiny}
    //       type={ButtonType.Text}
    //       className="!tw-p-0 !tw-h-[40px] !tw-w-[40px] !tw-rounded-full"
    //     >
    //       <MoreVertical className="tw-w-[20px] tw-h-[20px]" />
    //     </Button>
    //   )}

    //   <ul
    //     data-open={open}
    //     className={cn(
    //       "bg-background-overlay border border-border-overlay rounded-md z-[1]",
    //       "absolute whitespace-nowrap overflow-hidden px-2 py-2",
    //       "flex flex-col gap-1.5",
    //       "opacity-0 data-[open=true]:opacity-100 transition-all duration-300  invisible data-[open=true]:visible",
    //       "shadow-2xl",
    //       {
    //         "bottom-[calc(100%+5px)] left-1/2 -translate-x-1/2 data-[open=true]:bottom-[calc(100%+10px)]":
    //           placement === "top",
    //         "top-[calc(100%+5px)] left-1/2 -translate-x-1/2 data-[open=true]:top-[calc(100%+10px)]":
    //           placement === "bottom",
    //       }
    //     )}
    //   >
    //     {actions.map((action) => (
    //       <li key={action.id}>
    //         <button
    //           disabled={action.disabled}
    //           onClick={() => {
    //             if (action.onClick) action.onClick();
    //             hide();
    //           }}
    //           className={cn(
    //             "w-full text-center rounded-md disabled:opacity-50 disabled:cursor-not-allowed",
    //             "border border-transparent outline-none focus:outline-1 transition-colors duration-300",
    //             "px-2.5 py-1.5 h-[30px] text-sm !leading-none",
    //             {
    //               "hover:bg-background-overlay-hover focus:outline-border-strong focus:border-border-stronger":
    //                 !action.danger,
    //               "bg-destructive-400 hover:bg-destructive/50 focus:outline-amber-700":
    //                 action.danger,
    //             }
    //           )}
    //         >
    //           {action.label}
    //         </button>
    //       </li>
    //     ))}
    //   </ul>
    // </div>
  );
};
