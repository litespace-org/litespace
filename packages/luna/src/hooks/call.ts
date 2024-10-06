import { ICall } from "@litespace/types";
import { useMemo } from "react";

export function useCallRecordingStatus(status: ICall.RecordingStatus) {
  return useMemo(
    () => ({
      empty: status === ICall.RecordingStatus.Empty,
      recording: status === ICall.RecordingStatus.Recording,
      recorded: status === ICall.RecordingStatus.Recorded,
      processing: status === ICall.RecordingStatus.Processing,
      processed: status === ICall.RecordingStatus.Processed,
      queued: status === ICall.RecordingStatus.Queued,
      processingFailed: status === ICall.RecordingStatus.ProcessingFailed,
      idle: status === ICall.RecordingStatus.Idle,
    }),
    [status]
  );
}
