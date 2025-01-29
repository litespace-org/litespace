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
          className="tw-select-none tw-rounded tw-bg-background-overlay tw-px-[15px] tw-py-2.5 tw-text-[15px] tw-leading-none tw-text-foreground tw-border tw-border-border-overlay"
          sideOffset={5}
        >
          {content}
          <Arrow className="tw-fill-background-overlay" />
        </Content>
      </Portal>
    </Root>
  );
};
