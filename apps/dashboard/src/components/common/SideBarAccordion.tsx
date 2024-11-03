import React, { useCallback, useState } from "react";
import { ChevronDownIcon } from "@radix-ui/react-icons";
import cn from "classnames";
import { NavAccordionItem } from "@/types/navbar";
import SideBarItem from "./SideBarItem";
import { Void } from "@litespace/types";

export const SideBarAccordion: React.FC<{
  item: NavAccordionItem;
  open?: NavAccordionItem["id"];
  onClick: Void;
}> = ({ item, onClick }) => {
  const [open, setOpen] = useState<NavAccordionItem["id"] | null>(null);

  const show = useCallback((id: NavAccordionItem["id"]) => setOpen(id), []);
  const hide = useCallback(() => setOpen(null), []);
  const toggle = useCallback(
    (id: NavAccordionItem["id"]) => {
      if (open === id) return hide();
      return show(id);
    },
    [hide, open, show]
  );

  return (
    <div className="w-full">
      <ul className={`w-full ${open ? "border border-border rounded" : ""}`}>
        <li key={item.id}>
          <div
            onClick={() => toggle(item.id)}
            className="flex items-center justify-between h-[45px] px-4 py-2 border-b border-border hover:bg-selection cursor-pointer"
          >
            <div className="text-xl">{item.title}</div>
            <div
              data-open={item.id === open}
              className={cn(
                "data-[open=true]:rotate-180 transition-transform duration-300"
              )}
            >
              <ChevronDownIcon />
            </div>
          </div>
          <div
            data-open={item.id === open}
            className={cn(
              "text-foreground-light",
              "data-[open=true]:border-b data-[open=true]:border-border-strong",
              "grid grid-rows-[0fr] data-[open=true]:grid-rows-[1fr]",
              "transition-[grid-template-rows] duration-200 ease-in px-4 data-[open=true]:py-2"
            )}
          >
            <div className="w-full overflow-hidden">
              {item.childRoutes.map((route) => (
                <SideBarItem onClick={onClick} option={route} />
              ))}
            </div>
          </div>
        </li>
      </ul>
    </div>
  );
};
