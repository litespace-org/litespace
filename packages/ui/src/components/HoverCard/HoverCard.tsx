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
    <Root openDelay={0}>
      <Trigger asChild>{children}</Trigger>
      <Portal>
        <Content
          side={side}
          align={align}
          className="select-none rounded bg-natural-50 px-[15px] py-2.5 border border-natural-100"
          sideOffset={5}
        >
          {content}
          <Arrow className="fill-natural-50" />
        </Content>
      </Portal>
    </Root>
  );
};
