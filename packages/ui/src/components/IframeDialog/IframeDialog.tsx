import { Root, Portal, Overlay, Title, Content } from "@radix-ui/react-dialog";
import React from "react";
import cn from "classnames";
import { Button } from "@/components/Button";
import X from "@litespace/assets/X";
import Spinner from "@litespace/assets/Spinner";

export const IframeDialog: React.FC<{
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  url?: string;
  loading?: boolean;
}> = ({ open, url, loading, onOpenChange }) => {
  return (
    <Root open={open} onOpenChange={onOpenChange}>
      <Portal>
        <Content
          className={cn("fixed inset-0 z-dialog")}
          aria-describedby="Iframe dialog"
        >
          <Overlay
            onClick={() => onOpenChange?.(false)}
            className="fixed inset-0 backdrop-blur-[7.5px] bg-[#00000080] z-iframe-dialog-overlay"
          />
          <Title className="hidden">Iframe dialog</Title>

          <div className="absolute top-0 left-0 w-full bg-natural-50 h-16 flex items-center justify-center px-4 z-iframe-dialog-conent">
            <Button
              onClick={() => onOpenChange?.(false)}
              type="natural"
              variant="secondary"
              endIcon={<X className="icon" />}
              className="me-auto"
            />
          </div>

          {loading ? (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-iframe-dialog-conent">
              <Spinner className="w-10 h-10 fill-natural-50" />
            </div>
          ) : (
            <div
              className={cn(
                "w-full h-full sm:w-[512px] sm:h-[750px] bg-natural-50 max-h-[85vh]",
                "absolute top-16 sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 z-iframe-dialog-conent"
              )}
            >
              <iframe
                name="iframe"
                className="h-full w-full sm:rounded-md"
                src={url}
              />
            </div>
          )}
        </Content>
      </Portal>
    </Root>
  );
};
