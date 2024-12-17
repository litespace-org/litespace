import { useFindTutorRatings } from "@litespace/headless/rating";
import React, { useCallback } from "react";
import { LoadingTutorInfo } from "@/components/TutorProfile/LoadingTutorInfo";
import { ratingOrganizer } from "@/lib/ratings";
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
import { TutorLoadingError } from "@/components/TutorProfile/TutorLoadingError";

const NoTutorRatings: React.FC<{ tutorName: string | null }> = ({
  tutorName,
}) => {
  const intl = useFormatMessage();
  return (
    <div className="flex flex-col mt-20 gap-14 items-center justify-center">
      <NewTutor />
      <Typography
        element="h4"
        weight="bold"
        className="text-natural-950 text-center mb-20"
      >
        {intl("tutor.profile.first-rating", { tutor: tutorName })}
      </Typography>
    </div>
  );
};

const Ratings: React.FC<{ id: number; tutorName: string | null }> = ({
  id,
  tutorName,
}) => {
  const { user } = useUser();
  const intl = useFormatMessage();
  const ratingsQuery = useFindTutorRatings(id);

  const refetchRatings = useCallback(() => {
    ratingsQuery.refetch();
  }, [ratingsQuery]);

  if (ratingsQuery.isLoading || ratingsQuery.isPending)
    return <LoadingTutorInfo />;

  if (ratingsQuery.error || !user)
    return <TutorLoadingError refetchRatings={refetchRatings} />;

  const ratings = ratingOrganizer(ratingsQuery.data.list, user.id);

  return (
    <div className="flex my-8 mx-10 gap-4 flex-wrap justify-center">
      {isEmpty(ratings) ? <NoTutorRatings tutorName={tutorName} /> : null}

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

      <div className="flex gap-10 flex-col items-center justify-center mt-10">
        <Typography
          element="subtitle-1"
          weight="medium"
          className="text-natural-950 w-2/3 text-center"
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
