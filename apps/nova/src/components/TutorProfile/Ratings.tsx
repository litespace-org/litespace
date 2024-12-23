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
import cn from "classnames";

const NoTutorRatings: React.FC<{ tutorName: string | null }> = ({
  tutorName,
}) => {
  const intl = useFormatMessage();
  return (
    <div className="flex gap-[88px] tw-relative items-center justify-center h-[294px] w-full">
      <Typography
        element="subtitle-1"
        weight="bold"
        className="text-natural-950 text-center -translate-y-7 max-w-[476px]"
      >
        {intl("tutor.profile.first-rating", { tutor: tutorName })}
      </Typography>
      <NewTutor width={292} className="basis-full mt-16 max-w-[292px]" />
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
    () => organizeRatings(ratingsQuery.data?.list, user?.id),
    // () => organizeRatings([], user?.id),
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
    <div className="flex flex-col y-8 py-8 mx-10 gap-10  justify-center">
      {isEmpty(ratings) ? (
        <NoTutorRatings tutorName={tutorName} />
      ) : (
        <div className="grid gap-4 flex-wrap justify-center grid-cols-[repeat(auto-fill,minmax(256px,1fr))]">
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
      )}

      <div
        className={cn(
          "flex gap-10 flex-col items-center justify-center",
          isEmpty(ratings) && "-mt-12"
        )}
      >
        <Typography
          element="subtitle-1"
          weight="medium"
          className="text-natural-950 text-center max-w-[631px]"
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
