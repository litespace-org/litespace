import { useCallRecordingStatus, useFormatMessage } from "@/hooks";
import { ICall } from "@litespace/types";
import { useMemo } from "react";
import cn from "classnames";
import { IconField } from "@/components/IconField";
import { Video } from "react-feather";

const Status: React.FC<{
  status: ICall.RecordingStatus;
  interview?: boolean;
}> = ({ status, interview = false }) => {
  const intl = useFormatMessage();
  const {
    empty,
    recording,
    recorded,
    processing,
    queued,
    processingFailed,
    idle,
    processed,
  } = useCallRecordingStatus(status);
  const recordingStatusText = useMemo(() => {
    if (empty)
      return intl(
        interview
          ? "page.interviews.status.empty"
          : "page.lessons.lesson.status.empty"
      );

    if (recording)
      return intl(
        interview
          ? "page.interviews.status.recording"
          : "page.lessons.lesson.status.recording"
      );

    if (recorded)
      return intl(
        interview
          ? "page.interviews.status.recorded"
          : "page.lessons.lesson.status.recorded"
      );

    if (processing || queued)
      return intl(
        interview
          ? "page.interviews.status.processing"
          : "page.lessons.lesson.status.processing"
      );

    if (processingFailed)
      return intl(
        interview
          ? "page.interviews.status.processing.failed"
          : "page.lessons.lesson.status.processing.failed"
      );
  }, [
    empty,
    interview,
    processing,
    processingFailed,
    queued,
    recorded,
    recording,
    intl,
  ]);

  if (idle || processed) return null;

  return (
    <IconField
      className={cn({
        "text-destructive-600": processingFailed,
        "text-foreground-light": !processingFailed,
        "text-warning-600/80": recording || processing || queued,
      })}
      Icon={Video}
    >
      {recordingStatusText}
    </IconField>
  );
};

export default Status;
