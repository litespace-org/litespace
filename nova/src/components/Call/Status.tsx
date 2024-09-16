import { useCallRecordingStatus } from "@/hooks/call";
import { messages } from "@litespace/luna";
import { ICall } from "@litespace/types";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";
import cn from "classnames";
import { Video } from "react-feather";

const Status: React.FC<{
  status: ICall.RecordingStatus;
  interview?: boolean;
}> = ({ status, interview = false }) => {
  const intl = useIntl();
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
      return intl.formatMessage({
        id: interview
          ? messages["page.interviews.status.empty"]
          : messages["page.lessons.lesson.status.empty"],
      });

    if (recording)
      return intl.formatMessage({
        id: interview
          ? messages["page.interviews.status.recording"]
          : messages["page.lessons.lesson.status.recording"],
      });

    if (recorded)
      return intl.formatMessage({
        id: interview
          ? messages["page.interviews.status.recorded"]
          : messages["page.lessons.lesson.status.recorded"],
      });

    if (processing || queued)
      return intl.formatMessage({
        id: interview
          ? messages["page.interviews.status.processing"]
          : messages["page.lessons.lesson.status.processing"],
      });

    if (processingFailed)
      return intl.formatMessage({
        id: interview
          ? messages["page.interviews.status.processing.failed"]
          : messages["page.lessons.lesson.status.processing.failed"],
      });
  }, [
    empty,
    interview,
    intl,
    processing,
    processingFailed,
    queued,
    recorded,
    recording,
  ]);

  if (idle || processed) return null;

  return (
    <li
      className={cn("flex flex-row items-center gap-2", {
        "text-destructive-600": processingFailed,
        "text-foreground-light": !processingFailed,
        "text-warning-600/80": recording || processing || queued,
      })}
    >
      <div>
        <Video />
      </div>
      <p>{recordingStatusText}</p>
    </li>
  );
};

export default Status;
