import { Alert, messages, Spinner } from "@litespace/luna";
import { ITutor } from "@litespace/types";
import { isEmpty } from "lodash";
import React, { useCallback, useMemo, useState } from "react";
import { useIntl } from "react-intl";
import { UseQueryResult } from "react-query";
import { useNavigate } from "react-router-dom";
import TutorCard from "@/components/Tutors/TutorCard";
import BookLesson from "./BookLesson";

const TutorList: React.FC<{
  tutors: UseQueryResult<ITutor.FindAvailableTutorsApiResponse, unknown>;
}> = ({ tutors }) => {
  const intl = useIntl();
  const navigate = useNavigate();
  const [tutor, setTutor] = useState<ITutor.FullTutor | null>(null);
  const select = useCallback((tutor: ITutor.FullTutor) => setTutor(tutor), []);
  const deselect = useCallback(() => setTutor(null), []);

  const name = useMemo(() => tutor?.name.ar, [tutor?.name.ar]);
  const tutorId = useMemo(() => tutor?.id, [tutor?.id]);

  const rules = useMemo(() => {
    if (!tutor?.id) return [];
    return tutors.data?.rules[tutor.id.toString()] || [];
  }, [tutor?.id, tutors.data?.rules]);

  const reload = useMemo(() => {
    return {
      label: intl.formatMessage({
        id: messages["global.labels.reload.page"],
      }),
      onClick() {
        navigate(0);
      },
    };
  }, [intl, navigate]);

  if (tutors.isLoading)
    return (
      <div className="flex items-center justify-center h-[500px]">
        <Spinner />
      </div>
    );

  if (tutors.isError)
    return (
      <Alert
        title={intl.formatMessage({
          id: messages["error.tutors.list.error"],
        })}
        action={reload}
      >
        {tutors.error instanceof Error ? tutors.error.message : null}
      </Alert>
    );

  // todo: show empty search list with a nice image
  if (!tutors.data || isEmpty(tutors.data.tutors))
    return (
      <Alert
        title={intl.formatMessage({ id: messages["error.tutors.list.empty"] })}
      />
    );

  return (
    <div className="grid grid-cols-12 gap-6">
      {tutors.data.tutors.map((tutor) => (
        <div
          key={tutor.id}
          className="col-span-12 md:col-span-6 lg:col-span-4 2xl:col-span-3"
        >
          <TutorCard tutor={tutor} select={() => select(tutor)} />
        </div>
      ))}

      {!!name && !!tutorId ? (
        <BookLesson
          open={!!tutor}
          close={deselect}
          name={name}
          rules={rules}
          tutorId={tutorId}
        />
      ) : null}
    </div>
  );
};

export default TutorList;
