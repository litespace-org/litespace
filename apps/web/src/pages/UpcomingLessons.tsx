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
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@litespace/ui/Toast";
import { first } from "lodash";
import { IUser } from "@litespace/types";
import { getErrorMessageId } from "@litespace/ui/errorMessage";
import { capture } from "@/lib/sentry";
import dayjs from "@/lib/dayjs";
import { Web } from "@litespace/utils/routes";

type RateLessonParams = {
  tutorId: number | null;
  lessonId: number | null;
  tutorName: string | null;
  start: string | null;
  canRate: boolean;
};

const defaultRateLessonParams: RateLessonParams = {
  tutorId: null,
  lessonId: null,
  start: null,
  tutorName: null,
  canRate: false,
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

  const ratingQuery = useFindTutorRatings(rateLessonParams.tutorId, {
    page: 1,
    size: 1,
  });

  const lessons = useInfiniteLessons({
    users: user ? [user?.id] : [],
    userOnly: true,
    future: true,
    past: true,
    ratified: true,
    canceled: true,
  });

  // used to show rate dialog only if the lesson is already started
  const isRatingLessonStarted = useMemo(() => {
    return dayjs.utc(rateLessonParams.start).isBefore(dayjs.utc());
  }, [rateLessonParams.start]);

  const rateTutor = useCreateRatingTutor({
    onSuccess: () => setRateLessonParams(defaultRateLessonParams),
    onError: (error: unknown) => {
      capture(error);
      const errorMessage = getErrorMessageId(error);
      toast.error({
        title: intl("tutor.rate.error"),
        description: errorMessage,
      });
    },
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
    const canRate =
      (!rating || rating.userId !== user.id) && isRatingLessonStarted;
    setRateLessonParams((prev) => ({ ...prev, canRate }));
  }, [ratingQuery.data, ratingQuery.isPending, user, isRatingLessonStarted]);

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
        />
      ) : null}
    </div>
  );
};

export default UpcomingLessons;
