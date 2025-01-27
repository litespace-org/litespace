import PageTitle from "@/components/Common/PageTitle";
import Content from "@/components/UpcomingLessons/Content";
import { Route } from "@/types/routes";
import { useUserContext } from "@litespace/headless/context/user";
import { useInfiniteLessons } from "@litespace/headless/lessons";
import {
  useCreateRatingTutor,
  useFindTutorRatings,
} from "@litespace/headless/rating";
import { getRateLessonQuery } from "@/lib/query";
import { useFormatMessage } from "@litespace/luna/hooks/intl";
import { RatingDialog } from "@litespace/luna/TutorFeedback";
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@litespace/luna/Toast";
import { first } from "lodash";
import { IUser } from "@litespace/types";
import { orUndefined } from "@litespace/sol/utils";

type RateDialogInfo = {
  tutorId: number | null;
  lessonId: number | null;
  tutorName: string | null;
  canRate: boolean;
};

const defaultRateDialogInfo: RateDialogInfo = {
  tutorId: null,
  lessonId: null,
  tutorName: null,
  canRate: false,
};

const UpcomingLessons: React.FC = () => {
  const intl = useFormatMessage();
  const navigate = useNavigate();
  const { user } = useUserContext();
  const toast = useToast();

  const [params, setParams] = useSearchParams();
  const [rateDialogInfo, setRateDialogInfo] = useState<RateDialogInfo>(
    defaultRateDialogInfo
  );

  const ratingQuery = useFindTutorRatings(rateDialogInfo.tutorId, {
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

  const rateTutor = useCreateRatingTutor({
    onSuccess: () => setRateDialogInfo(defaultRateDialogInfo),
    onError: () =>
      toast.error({
        title: intl("tutor.rate.error"),
      }),
  });

  useEffect(() => {
    if (!user) return navigate(Route.Root);
  }, [navigate, user]);

  useEffect(() => {
    const student = user?.role == IUser.Role.Student;
    const data = !!rateDialogInfo.tutorId && !!rateDialogInfo.lessonId;
    if (!student || data) return;
    const { tutorId, lessonId, tutorName } = getRateLessonQuery(params);
    setRateDialogInfo((prev) => ({ ...prev, tutorId, lessonId, tutorName }));
    // Reste url search params
    setParams({});
  }, [
    setParams,
    params,
    user?.role,
    rateDialogInfo.tutorId,
    rateDialogInfo.lessonId,
  ]);

  useEffect(() => {
    if (
      !ratingQuery.data ||
      !user ||
      ratingQuery.isPending ||
      ratingQuery.isPending
    )
      return;
    const rating = first(ratingQuery.data.list);
    const canRate = !rating || rating.userId !== user.id;
    setRateDialogInfo((prev) => ({ ...prev, canRate }));
  }, [ratingQuery.data, ratingQuery.isPending, user]);

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

      {rateDialogInfo.lessonId &&
      rateDialogInfo.tutorId &&
      rateDialogInfo.canRate &&
      user ? (
        <RatingDialog
          open
          loading={rateTutor.isPending}
          studentId={user.id}
          studentName={user.name}
          tutorName={rateDialogInfo.tutorName}
          imageUrl={orUndefined(user.image)}
          onClose={() => setRateDialogInfo(defaultRateDialogInfo)}
          onSubmit={(payload) => {
            if (!rateDialogInfo.tutorId) return;
            rateTutor.mutate({
              rateeId: rateDialogInfo.tutorId,
              value: payload.value,
              feedback: payload.feedback,
            });
          }}
        />
      ) : null}
    </div>
  );
};

export default UpcomingLessons;
