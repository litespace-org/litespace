import PageTitle from "@/components/Common/PageTitle";
import Content from "@/components/UpcomingLessons/Content";
import { useUserContext } from "@litespace/headless/context/user";
import { useInfiniteLessons } from "@litespace/headless/lessons";
import {
  useCreateRatingTutor,
  useFindTutorRatings,
} from "@litespace/headless/rating";
import { getRateLessonQuery } from "@/lib/query";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { RatingDialog } from "@litespace/ui/RatingDialog";
import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@litespace/ui/Toast";
import { first } from "lodash";
import { IUser } from "@litespace/types";
import dayjs from "@/lib/dayjs";
import { Web } from "@litespace/utils/routes";
import { useOnError } from "@/hooks/error";

type RateLessonParams = {
  tutorId: number | null;
  lessonId: number | null;
  tutorName: string | null;
  duration: number;
  start: string | null;
  canRate: boolean;
};

const defaultRateLessonParams: RateLessonParams = {
  tutorId: null,
  lessonId: null,
  start: null,
  tutorName: null,
  canRate: false,
  duration: 0,
};

const UpcomingLessons: React.FC = () => {
  const intl = useFormatMessage();
  const navigate = useNavigate();
  const { user } = useUserContext();
  const toast = useToast();

  const [params, setParams] = useSearchParams();
  const [rateLessonParams, setRateLessonParams] = useState<RateLessonParams>(
    defaultRateLessonParams
  );

  const { query: ratingQuery, keys: ratingQueryKeys } = useFindTutorRatings(
    rateLessonParams.tutorId,
    {
      page: 1,
      size: 1,
    }
  );

  useOnError({
    type: "query",
    keys: ratingQueryKeys,
    error: ratingQuery.error,
  });

  const lessons = useInfiniteLessons({
    users: user ? [user?.id] : [],
    userOnly: true,
    future: true,
    past: true,
    ratified: true,
    canceled: true,
  });

  useOnError({
    type: "query",
    keys: lessons.keys,
    error: lessons.query.error,
  });

  const onError = useOnError({
    type: "mutation",
    handler: ({ messageId }) => {
      toast.error({
        title: intl("tutor.rate.error"),
        description: intl(messageId),
      });
    },
  });

  const rateTutor = useCreateRatingTutor({
    onSuccess: () => setRateLessonParams(defaultRateLessonParams),
    onError,
  });

  const submitRating = useCallback(
    (payload: { value: number; feedback: string | null }) => {
      if (!rateLessonParams.tutorId) return;
      rateTutor.mutate({
        rateeId: rateLessonParams.tutorId,
        value: payload.value,
        feedback: payload.feedback,
      });
    },
    [rateLessonParams.tutorId, rateTutor]
  );

  useEffect(() => {
    if (!user) return navigate(Web.Root);
  }, [navigate, user]);

  useEffect(() => {
    const student = user?.role == IUser.Role.Student;
    const data = !!rateLessonParams.tutorId && !!rateLessonParams.lessonId;
    if (!student || data) return;
    const query = getRateLessonQuery(params);
    if (!query) return;
    setRateLessonParams((prev) => ({
      ...prev,
      tutorId: query.tutorId,
      lessonId: query.lessonId,
      start: query.start,
      tutorName: query.tutorName,
      duration: query.duration,
    }));
    // Reste url search params
    setParams({});
  }, [
    setParams,
    params,
    user?.role,
    rateLessonParams.tutorId,
    rateLessonParams.lessonId,
  ]);

  useEffect(() => {
    if (
      !ratingQuery.data ||
      !user ||
      ratingQuery.isPending ||
      ratingQuery.isPending
    )
      return;
    // by convention, if the user has already rated the tutor,
    // his rating shall be in the begining of the response from
    // the server.
    const rating = first(ratingQuery.data.list);
    const now = dayjs.utc();
    const start = dayjs.utc(rateLessonParams.start);
    const end = start
      .add(rateLessonParams.duration, "minutes")
      .add(30, "minutes");
    const started = start.isBefore(now);
    const eneded = now.isAfter(end);
    const rated = rating && rating.userId === user.id;
    const canRate = !rated && started && !eneded;
    setRateLessonParams((prev) => ({ ...prev, canRate }));
  }, [
    ratingQuery.data,
    ratingQuery.isPending,
    user,
    rateLessonParams.start,
    rateLessonParams.duration,
  ]);

  return (
    <div className="p-6 max-w-screen-3xl mx-auto w-full h-full">
      <PageTitle title={intl("upcoming-lessons.title")} className="mb-6" />

      <Content
        list={lessons.list}
        loading={lessons.query.isPending}
        fetching={lessons.query.isFetching && !lessons.query.isPending}
        error={lessons.query.isError}
        more={lessons.more}
        hasMore={lessons.query.hasNextPage && !lessons.query.isPending}
        refetch={lessons.query.refetch}
      />

      {rateLessonParams.lessonId &&
      rateLessonParams.tutorId &&
      rateLessonParams.canRate &&
      user ? (
        <RatingDialog
          submitting={rateTutor.isPending}
          close={() => setRateLessonParams(defaultRateLessonParams)}
          submit={submitRating}
          title={intl("rating-dialog.rate-tutor.title")}
          header={intl("rating-dialog.rate-tutor.header", {
            tutor: rateLessonParams.tutorName,
          })}
          description={intl("rating-dialog.rate-tutor.description")}
          maxAllowedCharacters={500}
        />
      ) : null}
    </div>
  );
};

export default UpcomingLessons;
