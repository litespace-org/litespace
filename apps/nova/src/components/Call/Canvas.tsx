import { production } from "@/constants/env";
import { Button, ButtonSize, ButtonType, Dialog } from "@litespace/luna";
import { Void } from "@litespace/types";
import { forwardRef } from "react";

export const CallCanvas = forwardRef<
  HTMLCanvasElement,
  {
    open: boolean;
    close: Void;
    exportRecording: Void;
  }
>(({ open, close, exportRecording }, ref) => {
  if (production) return <canvas dir="ltr" className="hidden" ref={ref} />;
  return (
    <Dialog open={open} close={close} title="Recording Preview">
      <div className="mb-4">
        <Button
          onClick={exportRecording}
          type={ButtonType.Secondary}
          size={ButtonSize.Small}
        >
          Export
        </Button>
      </div>
      <canvas dir="ltr" ref={ref} />
    </Dialog>
  );
});
