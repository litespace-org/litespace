import { atlas, backend } from "@/lib/atlas";
import {
  Button,
  ButtonType,
  DatePicker,
  messages,
  Spinner,
  toaster,
} from "@litespace/luna";
import { IInterview, ISlot } from "@litespace/types";
import React, { useCallback, useMemo, useState } from "react";
import { useIntl } from "react-intl";
import { useMutation, useQuery, UseQueryResult } from "react-query";
import dayjs from "@/lib/dayjs";
import { Dayjs } from "dayjs";
import { flatten } from "lodash";
import { splitSlot } from "@litespace/sol";
import { asAssetUrl } from "@litespace/atlas";
import cn from "classnames";
import { marked } from "marked";
import markdown from "@/markdown/tutorOnboarding/interview.md?raw";
import RawHtml from "@/components/TutorOnboardingSteps/RawHtml";
import { selectCurrentInterview } from "@/lib/interview";
import ScheduleInterview from "./ScheduleInterview";

const Interview: React.FC<{
  interviews: UseQueryResult<IInterview.Self[], unknown>;
}> = ({ interviews }) => {
  const currentInterview = useMemo(() => {
    if (!interviews.data) return null;
    return selectCurrentInterview(interviews.data);
  }, [interviews.data]);

  const interviewCall = useQuery({
    queryFn: async () => {
      if (!currentInterview) return null;
      return await atlas.call.findById(currentInterview.ids.call);
    },
    queryKey: "find-interview-call",
    enabled: !!currentInterview,
  });

  const interviewer = useQuery({
    queryKey: "select-interviewer",
    queryFn: () => atlas.user.selectInterviewer(),
    retry: false,
  });

  const onScheduleSuccess = useCallback(() => {
    interviews.refetch();
  }, [interviews]);

  const html = useMemo(() => {
    return marked.parse(
      markdown.replace(/{interviewer}/gi, interviewer.data?.name.ar || ""),
      { async: false }
    );
  }, [interviewer.data?.name.ar]);

  if (interviewer.isLoading || interviews.isLoading || interviewCall.isLoading)
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Spinner />
      </div>
    );

  return (
    <div className="pb-10 flex flex-col w-full">
      <RawHtml html={html} />

      {interviewer.data ? (
        <ScheduleInterview
          interviewer={interviewer.data}
          onSuccess={onScheduleSuccess}
        />
      ) : null}
    </div>
  );
};

export default Interview;
