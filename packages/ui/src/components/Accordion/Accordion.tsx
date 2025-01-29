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
    <div className="tw-w-full">
      <ul className="tw-w-full tw-border tw-border-border tw-rounded">
        {items.map((item) => (
          <li key={item.id}>
            <div
              onClick={() => toggle(item.id)}
              className="tw-flex tw-items-center tw-justify-between tw-h-[45px] tw-px-4 tw-py-2 tw-border-b tw-border-border hover:tw-bg-selection tw-cursor-pointer"
            >
              <div>{item.trigger}</div>
              <div
                data-open={item.id === open}
                className={cn(
                  "data-[open=true]:tw-rotate-180 tw-transition-transform tw-duration-300"
                )}
              >
                <ChevronDownIcon />
              </div>
            </div>
            <div
              data-open={item.id === open}
              className={cn(
                "tw-text-foreground-light",
                "data-[open=true]:tw-border-b data-[open=true]:tw-border-border-strong",
                "tw-grid tw-grid-rows-[0fr] data-[open=true]:tw-grid-rows-[1fr]",
                "tw-transition-[grid-template-rows] tw-duration-200 tw-ease-in tw-px-4 data-[open=true]:tw-py-2"
              )}
            >
              <div className="tw-w-full tw-overflow-hidden">{item.content}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
