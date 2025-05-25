import React from "react";
import {
  Provider,
  Root,
  Trigger,
  Portal,
  Content,
  Arrow,
  TooltipContentProps,
} from "@radix-ui/react-tooltip";

export const Tooltip: React.FC<{
  content: React.ReactNode;
  children: React.ReactNode;
  show?: boolean;
  side?: TooltipContentProps["side"];
}> = ({ content, children, side, show = true }) => {
  if (!show) return null;

  return (
    <Provider delayDuration={120}>
      <Root>
        <Trigger asChild>{children}</Trigger>
        <Portal>
          <Content
            side={side}
            dir="rtl"
            className="p-3 rounded-lg bg-natural-50 shadow-tooltip z-tooltip"
            sideOffset={5}
          >
            {content}
            <Arrow className="fill-natural-50" />
          </Content>
        </Portal>
      </Root>
    </Provider>
  );
};
