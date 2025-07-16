import TimingSelection from "@/components/TutorOnboarding/Steps/Interview/Book/TimingSelection";
import {
  InterviewErrorLoading,
  InterviewLoading,
} from "@/components/TutorOnboarding/Steps/Interview/Loading";
import { useOnError } from "@/hooks/error";
import dayjs from "@/lib/dayjs";
import { useFindAvailabilitySlots } from "@litespace/headless/availabilitySlots";
import { useSelectInterviewer } from "@litespace/headless/interviews";
import { IAvailabilitySlot, IInterview, Void } from "@litespace/types";
import { Dayjs } from "dayjs";
import React, { useState } from "react";

const Book: React.FC<{
  sync: Void;
  syncing: boolean;
}> = ({ sync, syncing }) => {
  const interviewerQuery = useSelectInterviewer();

  useOnError({
    type: "query",
    error: interviewerQuery.error,
    keys: interviewerQuery.keys,
  });

  if (interviewerQuery.isLoading) return <InterviewLoading />;

  if (interviewerQuery.isError)
    return <InterviewErrorLoading refetch={interviewerQuery.refetch} />;

  if (interviewerQuery.data)
    return (
      <Content
        interviewer={interviewerQuery.data}
        sync={sync}
        syncing={syncing}
      />
    );
};

const Content: React.FC<{
  interviewer: IInterview.SelectInterviewerApiResponse;
  syncing: boolean;
  sync: Void;
}> = ({ interviewer, sync, syncing }) => {
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());

  const slotsQuery = useFindAvailabilitySlots({
    userIds: [interviewer.id],
    purposes: [
      IAvailabilitySlot.Purpose.Interview,
      IAvailabilitySlot.Purpose.General,
    ],
    after: selectedDate.startOf("month").toISOString(),
    before: selectedDate.endOf("month").toISOString(),
    full: true,
  });

  useOnError({
    type: "query",
    error: slotsQuery.error,
    keys: slotsQuery.keys,
  });

  if (slotsQuery.isLoading) return <InterviewLoading />;

  if (slotsQuery.isError)
    return <InterviewErrorLoading refetch={slotsQuery.refetch} />;

  return (
    <div className="w-full py-14 flex flex-col items-center gap-14">
      <TimingSelection
        slots={slotsQuery.data?.slots.list || []}
        bookedSlots={slotsQuery.data?.subslots || []}
        sync={sync}
        syncing={syncing}
        setSelectedDate={setSelectedDate}
      />
    </div>
  );
};

export default Book;
