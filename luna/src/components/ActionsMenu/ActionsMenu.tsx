import React, { useCallback, useEffect, useRef, useState } from "react";
import { MoreVertical } from "react-feather";
import { Button, ButtonSize, ButtonType } from "@/components/Button";
import { MenuAction } from "@/components/ActionsMenu/types";
import cn from "classnames";

export const ActionsMenu: React.FC<{ actions: MenuAction[] }> = ({
  actions,
}) => {
  const [open, setOpen] = useState<boolean>(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const hide = useCallback(() => setOpen(false), []);
  const toggle = useCallback(() => setOpen(!open), [open]);

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
    <div className="relative" ref={menuRef}>
      <Button
        onClick={toggle}
        size={ButtonSize.Tiny}
        type={ButtonType.Text}
        className="!p-0 !h-[40px] !w-[40px] !rounded-full"
      >
        <MoreVertical className="w-[20px] h-[20px]" />
      </Button>

      <ul
        data-open={open}
        className={cn(
          "bg-background-overlay border border-overlay rounded-md z-[1]",
          "absolute whitespace-nowrap top-[calc(100%+5px)] left-1/2 -translate-x-1/2 overflow-hidden px-2 py-2",
          "flex flex-col gap-1.5",
          "opacity-0 data-[open=true]:opacity-100 transition-all duration-300 data-[open=true]:top-[calc(100%+10px)] invisible data-[open=true]:visible",
          "shadow-2xl"
        )}
      >
        {actions.map((action) => (
          <li key={action.id}>
            <button
              disabled={action.disabled}
              onClick={() => {
                if (action.onClick) action.onClick();
                hide();
              }}
              className={cn(
                "w-full text-center rounded-md disabled:opacity-50 disabled:cursor-not-allowed",
                "border border-transparent outline-none focus:outline-1 transition-colors duration-300",
                "px-2.5 py-1.5 h-[30px] text-sm !leading-none",
                {
                  "hover:bg-background-overlay-hover focus:outline-border-strong focus:border-border-stronger":
                    !action.danger,
                  "bg-destructive-400 hover:bg-destructive/50 focus:outline-amber-700":
                    action.danger,
                }
              )}
            >
              {action.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};
