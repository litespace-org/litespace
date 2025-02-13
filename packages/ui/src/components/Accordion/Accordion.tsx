import React from "react";
import cn from "classnames";

import { ChevronDownIcon } from "@radix-ui/react-icons";
import * as RadixAccordion from "@radix-ui/react-accordion";

import { AccordionItem } from "@/components/Accordion/types";
import { Typography } from "@/components/Typography";

export const Accordion: React.FC<{
  items: AccordionItem[];
}> = ({ items }) => {
  return (
    <RadixAccordion.Root
      type="single"
      className={cn(
        "tw-flex tw-flex-col tw-w-full tw-rounded-2xl tw-overflow-hidden tw-gap-2"
      )}
    >
      {items.map((item) => (
        <RadixAccordion.Item
          key={item.id}
          value={item.id.toString()}
          className={cn(
            "tw-bg-white tw-px-8 tw-py-6 tw-text-natural-950",
            "data-[state=open]:tw-text-brand-500"
          )}
        >
          <RadixAccordion.Header>
            <RadixAccordion.Trigger
              className={cn(
                "AccordionTrigger tw-flex tw-items-start tw-justify-between tw-w-full",
                "[&>.title]:data-[state=open]:tw-border-brand-500",
                "[&>.title]:data-[state=open]:tw-border-b",
                "[&>.title]:data-[state=open]:tw-pb-5",
                "[&>.icon]:data-[state=open]:tw-rotate-180",
                "*:tw-transition-all *:tw-duration-150 *:tw-ease-in-out"
              )}
            >
              <Typography className="title" element="body" weight="bold">
                {item.title}
              </Typography>
              <ChevronDownIcon
                className="icon tw-mt-1 tw-text-brand-500"
                aria-hidden
              />
            </RadixAccordion.Trigger>
          </RadixAccordion.Header>

          <RadixAccordion.Content
            className={cn(
              "tw-text-natural-950 tw-overflow-hidden",
              "data-[state=open]:tw-mb-2 data-[state=open]:tw-mt-3",
              "data-[state=closed]:tw-mb-0 data-[state=closed]:tw-mt-0",
              "data-[state=open]:tw-animate-slide-down data-[state=closed]:tw-animate-slide-up"
            )}
          >
            <Typography element="caption" weight="regular">
              {item.content}
            </Typography>
          </RadixAccordion.Content>
        </RadixAccordion.Item>
      ))}
    </RadixAccordion.Root>
  );
};
