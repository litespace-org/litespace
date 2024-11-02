import { asFullCallRecordingUrl } from "@litespace/luna/lib";
import { VideoPlayer } from "@litespace/luna/components/VideoPlayer";
import { Dialog } from "@litespace/luna/components/Dialog";
import React from "react";

const WatchCall: React.FC<{
  open: boolean;
  close: () => void;
  title: string;
  callId: number;
}> = ({ open, title, callId, close }) => {
  return (
    <Dialog title={title} open={open} close={close}>
      <div className="lg:min-w-[720px] min-h-[480px] xl:min-w-[1200px] xl:min-h-[700px] flex flex-col">
        <VideoPlayer src={asFullCallRecordingUrl(callId)} />
      </div>
    </Dialog>
  );
};

export default WatchCall;
