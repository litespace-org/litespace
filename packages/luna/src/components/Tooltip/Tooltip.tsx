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
  side?: TooltipContentProps["side"];
}> = ({ content, children, side }) => {
  return (
    <Provider delayDuration={120}>
      <Root>
        <Trigger asChild>{children}</Trigger>
        <Portal>
          <Content
            side={side}
            dir="rtl"
            className="tw-p-3 tw-rounded-lg tw-bg-natural-50 tw-shadow-tooltip"
            sideOffset={5}
          >
            {content}
            <Arrow className="tw-fill-natural-50" />
          </Content>
        </Portal>
      </Root>
    </Provider>
  );
};
