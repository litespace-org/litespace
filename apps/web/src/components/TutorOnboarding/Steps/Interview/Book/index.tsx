import { useOnError } from "@/hooks/error";
import { useSelectInterviewer } from "@litespace/headless/interviews";
import { Loading, LoadingError } from "@litespace/ui/Loading";
import React, { useRef } from "react";
import dayjs from "@/lib/dayjs";
import { useFindAvailabilitySlots } from "@litespace/headless/availabilitySlots";
import TimingSelection from "@/components/TutorOnboarding/Steps/Interview/Book/TimingSelection";
import Header from "@/components/TutorOnboarding/Steps/Interview/Header";
import { IInterview, Void } from "@litespace/types";

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

  if (interviewerQuery.isLoading)
    return (
      <div className="mx-auto mt-[15vh]">
        <Loading size="large" />
      </div>
    );

  if (interviewerQuery.isError || !interviewerQuery.data)
    return (
      <div className="mx-auto mt-[15vh]">
        <LoadingError size="small" retry={interviewerQuery.refetch} />
      </div>
    );

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
  const now = useRef(dayjs());
  const slotsQuery = useFindAvailabilitySlots({
    userId: interviewer.id,
    after: now.current.toISOString(),
    before: now.current.add(1, "month").toISOString(),
  });

  useOnError({
    type: "query",
    error: slotsQuery.error,
    keys: slotsQuery.keys,
  });

  if (slotsQuery.isLoading)
    return (
      <div className="mx-auto mt-[15vh]">
        <Loading size="large" />
      </div>
    );

  if (slotsQuery.isError || !slotsQuery.data)
    return (
      <div className="mx-auto mt-[15vh]">
        <LoadingError size="small" retry={slotsQuery.refetch} />
      </div>
    );

  return (
    <div className="w-full py-14 flex flex-col items-center gap-14">
      <Header tutor={interviewer.name} />
      <TimingSelection
        slots={slotsQuery.data.slots.list}
        bookedSlots={slotsQuery.data.subslots}
        sync={sync}
        syncing={syncing}
      />
    </div>
  );
};

export default Book;
