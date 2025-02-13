import React from "react";
import cn from "classnames";

import ArrowUp from "@litespace/assets/ArrowUp";
import {
  Root,
  Item,
  Header,
  Trigger,
  Content,
} from "@radix-ui/react-accordion";

import { AccordionItem } from "@/components/Accordion/types";
import { Typography } from "@/components/Typography";

export const Accordion: React.FC<{
  items: AccordionItem[];
}> = ({ items }) => {
  return (
    <Root
      collapsible
      type="single"
      className={cn(
        "tw-flex tw-flex-col tw-w-full tw-rounded-2xl tw-overflow-hidden tw-gap-2"
      )}
    >
      {items.map((item) => (
        <Item
          key={item.id}
          value={item.id.toString()}
          className={cn(
            "tw-bg-white data-[state=open]:tw-pb-6 tw-text-natural-950",
            "data-[state=open]:tw-text-brand-500 tw-transition-all tw-duration-150"
          )}
        >
          <Header>
            <Trigger
              className={cn(
                "tw-flex tw-items-start tw-justify-between tw-w-full tw-px-8 tw-py-6 data-[state=open]:tw-pb-0",
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
              <ArrowUp className="icon tw-mt-1 tw-text-brand-500" aria-hidden />
            </Trigger>
          </Header>

          <Content
            className={cn(
              "tw-text-natural-950 tw-overflow-hidden tw-px-8",
              "data-[state=open]:tw-mt-5",
              "data-[state=closed]:tw-mb-0 data-[state=closed]:tw-mt-0",
              "data-[state=open]:tw-animate-slide-down data-[state=closed]:tw-animate-slide-up"
            )}
          >
            <Typography element="caption" weight="regular">
              {item.content}
            </Typography>
          </Content>
        </Item>
      ))}
    </Root>
  );
};
