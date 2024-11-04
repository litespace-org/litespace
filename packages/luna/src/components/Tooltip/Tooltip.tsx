import React from "react";
import {
  Provider,
  Root,
  Trigger,
  Portal,
  Content,
  Arrow,
} from "@radix-ui/react-tooltip";

export const Tooltip: React.FC<{
  content: React.ReactNode;
  children: React.ReactNode;
}> = ({ content, children }) => {
  return (
    <Provider delayDuration={350}>
      <Root>
        <Trigger asChild>{children}</Trigger>
        <Portal>
          <Content
            className="tw-select-none tw-rounded tw-bg-surface-200 tw-px-[15px] tw-py-2.5 tw-text-[15px] tw-leading-none tw-text-foreground"
            sideOffset={5}
          >
            {content}
            <Arrow className="tw-fill-surface-200" />
          </Content>
        </Portal>
      </Root>
    </Provider>
  );
};
