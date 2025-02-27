import React from "react";
import {
  Root,
  Trigger,
  Portal,
  Content,
  Arrow,
  HoverCardContentProps,
} from "@radix-ui/react-hover-card";

export const HoverCard: React.FC<{
  content: React.ReactNode;
  children: React.ReactNode;
  side?: HoverCardContentProps["side"];
  align?: HoverCardContentProps["align"];
}> = ({ content, children, side = "top", align = "center" }) => {
  return (
    <Root>
      <Trigger asChild>{children}</Trigger>
      <Portal>
        <Content
          side={side}
          align={align}
          className="select-none rounded bg-background-overlay px-[15px] py-2.5 text-[15px] leading-none text-foreground border border-border-overlay"
          sideOffset={5}
        >
          {content}
          <Arrow className="fill-background-overlay" />
        </Content>
      </Portal>
    </Root>
  );
};
