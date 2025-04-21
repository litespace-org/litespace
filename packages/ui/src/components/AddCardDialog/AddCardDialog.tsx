import { Root, Portal, Overlay, Title, Content } from "@radix-ui/react-dialog";
import React from "react";
import cn from "classnames";
import { Button } from "@/components/Button";
import X from "@litespace/assets/X";

export const AddCardDialog: React.FC<{
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  addCardUrl: string;
}> = ({ open, addCardUrl, onOpenChange }) => {
  return (
    <Root open={open} onOpenChange={onOpenChange}>
      <Portal>
        <Overlay
          onClick={() => onOpenChange?.(false)}
          className="fixed inset-0 backdrop-blur-[7.5px] bg-[#00000080] z-dialog-overlay"
        />
        <Content
          className={cn("fixed inset-0 z-dialog")}
          aria-describedby="Add card dialog"
        >
          <Title className="hidden">Add card dialog</Title>
          <div className="w-full h-full relative">
            <div className="absolute top-0 left-0 w-full bg-natural-50 h-16 flex items-center justify-center px-4">
              <Button
                onClick={() => onOpenChange?.(false)}
                type="main"
                variant="tertiary"
                endIcon={<X className="icon" />}
                className="ms-auto"
              />
            </div>

            <div
              className={cn(
                "w-full h-full sm:w-[512px] sm:h-[750px]",
                "absolute top-16 sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2"
              )}
            >
              <iframe
                className="h-full w-full sm:rounded-md"
                src={addCardUrl}
              />
            </div>
          </div>
        </Content>
      </Portal>
    </Root>
  );
};
