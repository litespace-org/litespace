import { Alert, Spinner, useFormatMessage } from "@litespace/luna";
import { Element, ITutor, Wss } from "@litespace/types";
import { isEmpty } from "lodash";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { UseQueryResult } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import TutorCard from "@/components/Tutors/TutorCard";
import BookLesson from "@/components/Tutors/BookLesson";
import { useSockets } from "@litespace/headless/atlas";

type Tutor = Element<ITutor.FindOnboardedTutorsApiResponse["list"]>;

const TutorList: React.FC<{
  tutors: UseQueryResult<ITutor.FindOnboardedTutorsApiResponse, unknown>;
}> = ({ tutors }) => {
  const sockets = useSockets();
  const intl = useFormatMessage();
  const navigate = useNavigate();
  const [tutor, setTutor] = useState<Tutor | null>(null);
  const select = useCallback((tutor: Tutor) => setTutor(tutor), []);
  const deselect = useCallback(() => setTutor(null), []);

  const reload = useMemo(() => {
    return {
      label: intl("global.labels.reload.page"),
      onClick() {
        navigate(0);
      },
    };
  }, [intl, navigate]);

  const onUpdate = useCallback(async () => {
    const { data } = await tutors.refetch();
    if (!data || !tutor) return;
    const updated = data.list.find((t) => t.id === tutor.id);
    setTutor(updated || null);
  }, [tutor, tutors]);

  useEffect(() => {
    if (!sockets?.api) return;

    sockets.api.on(Wss.ServerEvent.TutorUpdated, onUpdate);
    sockets.api.on(Wss.ServerEvent.LessonBooked, onUpdate);
    sockets.api.on(Wss.ServerEvent.LessonCanceled, onUpdate);
    sockets.api.on(Wss.ServerEvent.RuleCreated, onUpdate);
    sockets.api.on(Wss.ServerEvent.RuleUpdated, onUpdate);
    sockets.api.on(Wss.ServerEvent.RuleDeleted, onUpdate);
    return () => {
      sockets.api.off(Wss.ServerEvent.TutorUpdated, onUpdate);
      sockets.api.off(Wss.ServerEvent.LessonBooked, onUpdate);
      sockets.api.off(Wss.ServerEvent.LessonCanceled, onUpdate);
      sockets.api.off(Wss.ServerEvent.RuleCreated, onUpdate);
      sockets.api.off(Wss.ServerEvent.RuleUpdated, onUpdate);
      sockets.api.off(Wss.ServerEvent.RuleDeleted, onUpdate);
    };
  }, [onUpdate, sockets?.api]);

  if (tutors.isLoading)
    return (
      <div className="flex items-center justify-center h-[500px]">
        <Spinner />
      </div>
    );

  if (tutors.isError)
    return (
      <Alert title={intl("error.tutors.list.error")} action={reload}>
        {tutors.error instanceof Error ? tutors.error.message : null}
      </Alert>
    );

  // todo: show empty search list with a nice image
  if (!tutors.data || isEmpty(tutors.data.list))
    return <Alert title={intl("error.tutors.list.empty")} />;

  return (
    <div className="grid grid-cols-12 gap-6">
      {tutors.data.list.map((tutor) => (
        <div
          key={tutor.id}
          className="col-span-12 md:col-span-6 lg:col-span-4 2xl:col-span-3"
        >
          <TutorCard tutor={tutor} select={() => select(tutor)} />
        </div>
      ))}

      {tutor && tutor.name ? (
        <BookLesson
          open={!!tutor}
          close={deselect}
          name={tutor.name}
          rules={tutor.rules}
          tutorId={tutor.id}
          notice={tutor.notice}
        />
      ) : null}
    </div>
  );
};

export default TutorList;
