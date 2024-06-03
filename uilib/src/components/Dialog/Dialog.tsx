import React from "react";
import {
  Root,
  Trigger,
  Portal,
  Overlay,
  Content,
  Title,
  Description,
  Close,
} from "@radix-ui/react-dialog";
import cn from "classnames";
import { Cross2Icon } from "@radix-ui/react-icons";

export const Dialog: React.FC<{
  trigger: React.ReactNode;
  children?: React.ReactNode;
  title: React.ReactElement | string;
  description?: React.ReactElement | string;
}> = ({ trigger, title, children, description }) => {
  const [open, setOpen] = React.useState(false);

  return (
    <Root open={open} onOpenChange={setOpen}>
      <Trigger>{trigger}</Trigger>
      <Portal>
        <Overlay className="ui-bg-blackA2 ui-data-[state=open]:animate-overlayShow ui-fixed ui-inset-0" />
        <Content
          className={cn(
            "ui-data-[state=open]:animate-contentShow ui-fixed",
            "ui-top-[50%] ui-left-[50%] ui-max-h-[85vh] ui-w-[90vw] ui-max-w-[450px]",
            "ui-translate-x-[-50%] ui-translate-y-[-50%]",
            "ui-rounded-[6px] ui-bg-white ui-p-[25px]",
            "ui-shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px]",
            "focus:outline-none"
          )}
        >
          <div
            className={cn(
              "ui-flex ui-flex-row ui-items-center ui-justify-between"
            )}
          >
            <Title
              className={cn(
                "ui-text-mauve12 ui-m-0 ui-text-[17px] ui-font-medium"
              )}
            >
              {title}
            </Title>

            <Close
              className={cn(
                "ui-text-violet11 ui-hover:bg-violet4 ui-focus:shadow-violet7",
                "ui-inline-flex ui-h-[25px] ui-w-[25px]",
                "ui-appearance-none ui-items-center ui-justify-center ui-rounded-full ui-focus:shadow-[0_0_0_2px]",
                "ui-focus:outline-none"
              )}
              aria-label="Close"
            >
              <Cross2Icon />
            </Close>
          </div>
          {description ? (
            <Description className="ui-text-mauve11 ui-mt-[10px] ui-mb-5 ui-text-[15px] ui-leading-normal">
              {description}
            </Description>
          ) : null}

          {children}
        </Content>
      </Portal>
    </Root>
  );
};
