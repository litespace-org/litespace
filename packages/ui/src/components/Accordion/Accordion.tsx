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
            "tw-bg-white tw-text-natural-950",
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
              <Typography
                tag="h1"
                className="tw-text-body tw-font-bold title tw-text-start"
              >
                {item.title}
              </Typography>
              <ArrowUp className="icon tw-mt-1 tw-text-brand-500" aria-hidden />
            </Trigger>
          </Header>

          <Content
            forceMount
            className={cn(
              "tw-text-natural-950 tw-overflow-hidden tw-px-8",
              "tw-grid tw-grid-rows-[0fr] data-[state=open]:tw-grid-rows-[1fr] tw-transition-[grid-template-rows] tw-duration-300"
            )}
          >
            <div className="tw-overflow-hidden">
              <Typography
                tag="p"
                className="tw-text-caption tw-font-regular tw-pt-5 tw-pb-6"
              >
                {item.content}
              </Typography>
            </div>
          </Content>
        </Item>
      ))}
    </Root>
  );
};
