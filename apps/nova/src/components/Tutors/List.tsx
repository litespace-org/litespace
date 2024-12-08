import { Alert } from "@litespace/luna/Alert";
import { Spinner } from "@litespace/luna/Spinner";
import { useFormatMessage } from "@litespace/luna/hooks/intl";
import { Element, ITutor, Wss } from "@litespace/types";
import { isEmpty } from "lodash";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { UseQueryResult } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import TutorCard from "@/components/Tutors/TutorCard";
import BookLesson from "@/components/Tutors/BookLesson";
import { useSocket } from "@litespace/headless/socket";

type Tutor = Element<ITutor.FindOnboardedTutorsApiResponse["list"]>;

const TutorList: React.FC<{
  tutors: UseQueryResult<ITutor.FindOnboardedTutorsApiResponse, unknown>;
}> = ({ tutors }) => {
  const socket = useSocket();
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
    if (!socket) return;

    socket.on(Wss.ServerEvent.TutorUpdated, onUpdate);
    socket.on(Wss.ServerEvent.LessonBooked, onUpdate);
    socket.on(Wss.ServerEvent.LessonCanceled, onUpdate);
    socket.on(Wss.ServerEvent.RuleCreated, onUpdate);
    socket.on(Wss.ServerEvent.RuleUpdated, onUpdate);
    socket.on(Wss.ServerEvent.RuleDeleted, onUpdate);
    return () => {
      socket.off(Wss.ServerEvent.TutorUpdated, onUpdate);
      socket.off(Wss.ServerEvent.LessonBooked, onUpdate);
      socket.off(Wss.ServerEvent.LessonCanceled, onUpdate);
      socket.off(Wss.ServerEvent.RuleCreated, onUpdate);
      socket.off(Wss.ServerEvent.RuleUpdated, onUpdate);
      socket.off(Wss.ServerEvent.RuleDeleted, onUpdate);
    };
  }, [onUpdate, socket]);

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
