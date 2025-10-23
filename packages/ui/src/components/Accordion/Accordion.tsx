import React from "react";
import cn from "classnames";
import ChevronDown from "@litespace/assets/ChevronDown";
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
  onValueChange?: (value: string) => void;
  defaultValue?: string;
}> = ({ items, defaultValue, onValueChange }) => {
  return (
    <Root
      collapsible
      type="single"
      className={cn("flex flex-col w-full rounded-2xl overflow-hidden gap-2")}
      onValueChange={onValueChange}
      defaultValue={defaultValue}
    >
      {items.map((item) => (
        <Item
          key={item.id}
          value={item.id}
          className={cn(
            "bg-white text-natural-950",
            "data-[state=open]:text-brand-500 transition-all duration-150"
          )}
        >
          <Header>
            <Trigger
              className={cn(
                "flex items-start justify-between w-full px-4 sm:px-8 py-6 data-[state=open]:pb-0",
                "[&>.title]:data-[state=open]:border-brand-500",
                "[&>.title]:data-[state=open]:border-b",
                "[&>.title]:data-[state=open]:pb-2 sm:[&>.title]:data-[state=open]:pb-5",
                "[&>.icon]:data-[state=open]:rotate-180",
                "*:transition-all *:duration-150 *:ease-in-out"
              )}
            >
              <Typography
                tag="h1"
                className="text-caption sm:text-body font-semibold sm:font-bold title text-start"
              >
                {item.title}
              </Typography>
              <ChevronDown
                className="shrink-0 w-[30px] h-6 [&>*]:stroke-brand-500 icon mt-1 text-brand-500"
                aria-hidden
              />
            </Trigger>
          </Header>

          <Content
            forceMount
            className={cn(
              "text-natural-950 overflow-hidden px-4 sm:px-8",
              "grid grid-rows-[0fr] data-[state=open]:grid-rows-[1fr] transition-[grid-template-rows] duration-300"
            )}
          >
            <div className="overflow-hidden">
              <Typography
                tag="p"
                className="text-tiny whitespace-pre-line sm:text-caption font-medium sm:font-normal pt-2 sm:pt-3 pb-6"
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
