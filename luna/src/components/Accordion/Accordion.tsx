import React, { useCallback, useState } from "react";
import { AccordionItem } from "@/components/Accordion/types";
import { ChevronDownIcon } from "@radix-ui/react-icons";
import cn from "classnames";

export const Accordion: React.FC<{
  items: AccordionItem[];
  open?: AccordionItem["id"];
}> = ({ items }) => {
  const [open, setOpen] = useState<AccordionItem["id"] | null>(null);

  const show = useCallback((id: AccordionItem["id"]) => setOpen(id), []);
  const hide = useCallback(() => setOpen(null), []);
  const toggle = useCallback(
    (id: AccordionItem["id"]) => {
      if (open === id) return hide();
      return show(id);
    },
    [hide, open, show]
  );

  return (
    <div className="w-full">
      <ul className="w-full border border-border rounded">
        {items.map((item) => (
          <li key={item.id}>
            <div
              onClick={() => toggle(item.id)}
              className="flex items-center justify-between h-[45px] px-4 py-2 border-b border-border hover:bg-selection cursor-pointer"
            >
              <div>{item.trigger}</div>
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
                "transition-[grid-template-rows] duration-300 ease-in px-4 data-[open=true]:py-2"
              )}
            >
              <div className="w-full overflow-hidden">{item.content}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
