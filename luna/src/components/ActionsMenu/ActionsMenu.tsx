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
              "text-center font-normal transition-all ease-out duration-200",
              "w-9 h-9 rounded-full flex items-center justify-center",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "outline-none transition-all outline-0 focus-visible:outline-2 focus-visible:outline-offset-1",
              "bg-background-alternative hover:bg-background-selection dark:bg-muted",
              "border border-border-strong hover:border-border-stronger focus-visible:outline-brand-600 text-foreground"
            )}
          >
            <MoreVertical className="w-5 h-5" />
          </button>
        )}
      </Trigger>

      <Portal>
        <Content
          className={cn(
            "min-w-56 bg-background-overlay border border-border-overlay rounded-md p-[5px]"
          )}
          sideOffset={5}
        >
          {actions.map((action) => (
            <Item
              key={action.id}
              className={cn(
                "px-2.5 py-1.5 h-[30px] text-sm !leading-none cursor-pointer",
                "ontline-none hover:outline-background-selection",
                action.danger && "text-destructive-600"
              )}
            >
              {action.label}
            </Item>
          ))}
        </Content>
      </Portal>
    </Root>
    // <div className="relative w-fit" ref={menuRef}>
    //   {children ? (
    //     <div onClick={toggle} className="cursor-pointer">
    //       {children}
    //     </div>
    //   ) : (
    //     <Button
    //       onClick={toggle}
    //       size={ButtonSize.Tiny}
    //       type={ButtonType.Text}
    //       className="!p-0 !h-[40px] !w-[40px] !rounded-full"
    //     >
    //       <MoreVertical className="w-[20px] h-[20px]" />
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
