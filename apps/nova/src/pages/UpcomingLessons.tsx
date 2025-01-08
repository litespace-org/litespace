import PageTitle from "@/components/Common/PageTitle";
import Content from "@/components/UpcomingLessons/Content";
import { Route } from "@/types/routes";
import { useUserContext } from "@litespace/headless/context/user";
import { useInfiniteLessons } from "@litespace/headless/lessons";
import {
  useCreateRatingTutor,
  useFindTutorRatings,
} from "@litespace/headless/rating";
import { useFindTutorInfo } from "@litespace/headless/tutor";
import { getLessonQuery } from "@litespace/sol/query";
import { useFormatMessage } from "@litespace/luna/hooks/intl";
import { RatingDialog } from "@litespace/luna/TutorFeedback";
import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@litespace/luna/Toast";
import { first } from "lodash";

type RateDialogInfo = {
  tutorId: number | null;
  lessonId: number | null;
  rateId: number | null;
  rateValue: number | null;
  rateFeedback: string | null;
  enabled: boolean;
};

const UpcomingLessons: React.FC = () => {
  const intl = useFormatMessage();
  const navigate = useNavigate();
  const { user } = useUserContext();
  const toast = useToast();

  const onRateError = useCallback(
    () =>
      toast.error({
        title: intl("tutor.rate.error"),
      }),
    [intl, toast]
  );

  const [params, setParams] = useSearchParams();
  const [rateDialogInfo, setRateDialogInfo] = useState<RateDialogInfo>({
    tutorId: null,
    lessonId: null,
    rateId: null,
    rateValue: null,
    rateFeedback: null,
    enabled: false,
  });

  const tutorQuery = useFindTutorInfo(rateDialogInfo.tutorId);
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

  const { mutate: createRating } = useCreateRatingTutor({
    onSuccess: () => setRateDialogInfo((prev) => ({ ...prev, enabled: false })),
    onError: onRateError,
  });

  useEffect(() => {
    if (!user) return navigate(Route.Root);
  }, [navigate, user]);

  useEffect(() => {
    if (params.toString() === "") return;
    if (user?.role !== "student") return;
    const { tutorId, lessonId } = getLessonQuery(params);
    setRateDialogInfo((prev) => ({ ...prev, tutorId, lessonId }));
    // reset the url as the data is already captured in the local state.
  }, [setParams, params, user?.role]);

  useEffect(() => {
    if (
      !ratingQuery.data ||
      !user ||
      ratingQuery.isPending ||
      ratingQuery.isPending
    )
      return;
    const rating = first(ratingQuery.data.list);
    const enabled = !!(rating && rating.userId !== user.id);
    setRateDialogInfo((prev) => ({ ...prev, enabled }));
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
      {user &&
      user.name &&
      tutorQuery.data &&
      tutorQuery.data.name &&
      tutorQuery.data.image ? (
        <RatingDialog
          open={rateDialogInfo.enabled}
          loading={ratingQuery.isPending}
          studentId={user.id}
          studentName={user.name}
          tutorName={tutorQuery.data.name}
          imageUrl={tutorQuery.data.image}
          feedback={rateDialogInfo.rateFeedback}
          rating={rateDialogInfo.rateValue || 0}
          onClose={() =>
            setRateDialogInfo((prev) => ({ ...prev, enabled: false }))
          }
          onSubmit={(payload) => {
            if (!tutorQuery.data) return;
            createRating({
              rateeId: tutorQuery.data.id,
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
