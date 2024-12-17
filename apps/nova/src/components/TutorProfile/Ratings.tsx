import { useFindTutorRatings } from "@litespace/headless/rating";
import React, { useCallback, useMemo } from "react";
import { organizeRatings } from "@/lib/ratings";
import { useUser } from "@litespace/headless/context/user";
import {
  TutorRatingCard,
  TutorRatingCardGroup,
} from "@litespace/luna/TutorFeedback";
import { Typography } from "@litespace/luna/Typography";
import { useFormatMessage } from "@litespace/luna/hooks/intl";
import Star from "@litespace/assets/Star";
import NewTutor from "@litespace/assets/NewTutor";
import { Button, ButtonSize } from "@litespace/luna/Button";
import { isEmpty } from "lodash";
import { Loader, LoadingError } from "@litespace/luna/Loading";

const NoTutorRatings: React.FC<{ tutorName: string | null }> = ({
  tutorName,
}) => {
  const intl = useFormatMessage();
  return (
    <div className="flex gap-[88px] items-center justify-center">
      <Typography
        element="subtitle-1"
        weight="bold"
        className="text-natural-950 text-center max-w-[476px]"
      >
        {intl("tutor.profile.first-rating", { tutor: tutorName })}
      </Typography>
      <div className="w-[292px] h-[294px]">
        <NewTutor />
      </div>
    </div>
  );
};

const Ratings: React.FC<{ id: number; tutorName: string | null }> = ({
  id,
  tutorName,
}) => {
  const { user } = useUser();
  const intl = useFormatMessage();
  const ratingsQuery = useFindTutorRatings(id, { page: 1, size: 30 });

  const refetchRatings = useCallback(() => {
    ratingsQuery.refetch();
  }, [ratingsQuery]);

  const ratings = useMemo(
    () => organizeRatings(ratingsQuery.data?.list || [], user?.id),
    [ratingsQuery.data, user]
  );

  if (ratingsQuery.isLoading || ratingsQuery.isPending)
    return (
      <div className="h-96 flex justify-center items-center">
        <Loader text={intl("tutor.profile.loading")} />
      </div>
    );

  if (ratingsQuery.error || !user)
    return (
      <div className="h-96 flex items-center justify-center">
        <LoadingError
          error={intl("tutor.profile.error")}
          retry={refetchRatings}
        />
      </div>
    );

  return (
    <div className="flex flex-col my-8 mx-10 gap-10  justify-center">
      {isEmpty(ratings) ? <NoTutorRatings tutorName={tutorName} /> : null}

      <div className="flex gap-4 flex-wrap justify-center">
        {ratings.map((rating) => {
          if (
            "userId" in rating &&
            (rating.feedback || rating.userId === user.id)
          )
            return (
              <TutorRatingCard
                feedback={rating.feedback}
                imageUrl={rating.image}
                rating={rating.value}
                studentId={rating.userId}
                studentName={rating.name}
                tutorName={tutorName}
                owner={rating.userId === user.id}
              />
            );

          if ("ratings" in rating)
            return (
              <TutorRatingCardGroup
                ratings={rating.ratings}
                tutorName={tutorName}
                value={rating.value}
              />
            );
        })}
      </div>

      <div className="flex gap-10 flex-col items-center justify-center ">
        <Typography
          element="subtitle-1"
          weight="medium"
          className="text-natural-950 text-center max-w-[912px]"
        >
          {intl("tutor.profile.your-ratings-help")}
        </Typography>

        <Button
          size={ButtonSize.Small}
          className="w-[386px] flex items-center gap-2"
        >
          <Typography element="body" weight="semibold">
            {intl("tutor.profile.rate-tutor")}
          </Typography>
          <Star className="[&>*]:fill-natural-50" />
        </Button>
      </div>
    </div>
  );
};

export default Ratings;
