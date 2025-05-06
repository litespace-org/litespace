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
import cn from "classnames";

export const Tooltip: React.FC<{
  content: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  show?: boolean;
  side?: TooltipContentProps["side"];
}> = ({ content, children, side, show = true, className }) => {
  return (
    <Provider delayDuration={120}>
      <Root>
        <Trigger asChild>{children}</Trigger>
        <Portal>
          {show ? (
            <Content
              side={side}
              dir="rtl"
              className={cn(
                "p-3 rounded-lg bg-natural-50 shadow-tooltip z-tooltip",
                className
              )}
              sideOffset={5}
            >
              {content}
              <Arrow className="fill-natural-50" />
            </Content>
          ) : null}
        </Portal>
      </Root>
    </Provider>
  );
};
