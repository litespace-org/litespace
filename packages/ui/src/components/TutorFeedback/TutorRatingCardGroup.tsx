import { RatingStars } from "@/components/RatingStars";
import { TutorRatingCardGroupProps } from "@/components/TutorFeedback/types";
import Quote from "@litespace/assets/Quote";
import { orUndefined } from "@litespace/utils/utils";
import cn from "classnames";
import React, { useMemo } from "react";
import { Avatar } from "@/components/Avatar";
import { Typography } from "@/components/Typography";
import { useFormatMessage } from "@/hooks";
import { countBy, first } from "lodash";

const MAX_DISPLAYED_NAMED = 3;

export const TutorRatingCardGroup: React.FC<TutorRatingCardGroupProps> = ({
  ratings,
  value,
  tutorName,
}) => {
  const intl = useFormatMessage();

  const raterNames = useMemo(() => {
    const firstRating = first(ratings);
    const oneRating = ratings.length === 1;
    if (oneRating && firstRating && firstRating.name) return firstRating.name;
    if (oneRating && firstRating && !firstRating.name)
      return intl("tutor.rating.name.placeholder", { value: tutorName });

    const { named = 0, unamed = 0 } = countBy(ratings, (rating) =>
      rating.name ? "named" : "unamed"
    );

    if (named === 0 && unamed > 0)
      return intl("tutor.rating.group-names.n-students", {
        count: unamed,
        tutor: tutorName,
      });

    const othersNamedCount =
      named <= MAX_DISPLAYED_NAMED ? 0 : named - MAX_DISPLAYED_NAMED;
    const othersCount = othersNamedCount + unamed;

    const names = ratings
      .filter((rating) => rating.name)
      .slice(0, MAX_DISPLAYED_NAMED)
      .map((rating) => rating.name)
      .join("، ");

    if (othersCount <= 0) return names;
    if (othersCount === 1)
      return intl("tutor.rating.group-names.one-more", {
        names,
      });
    if (othersCount > 1)
      return intl("tutor.rating.group-names.others", {
        names,
        count: othersCount,
      });
  }, [intl, ratings, tutorName]);

  return (
    <div
      className={cn(
        "tw-p-6 tw-bg-natural-50 tw-rounded-3xl",
        "tw-flex tw-flex-col tw-gap-6 tw-justify-between tw-items-center",
        "tw-shadow-feedback-card"
      )}
    >
      <div className="tw-flex -tw-ml-4">
        {ratings.map((rating, idx, arr) => {
          const isLast = arr.length - idx === 1;
          if (idx <= 4)
            return (
              <div
                key={rating.userId}
                className={cn(
                  "tw-w-[54px] tw-h-[54px] tw-rounded-full tw-overflow-hidden tw-border-[3px] tw-border-brand-500 -tw-mr-4 tw-relative",
                  "tw-felx tw-justify-center tw-items-center",
                  { "tw-bg-brand-600": idx === 4 }
                )}
                style={{ zIndex: idx }}
              >
                {idx < 4 || isLast ? (
                  <Avatar
                    alt={orUndefined(rating.name)}
                    seed={rating.userId.toString()}
                    src={idx <= 4 ? orUndefined(rating.imageUrl) : undefined}
                  />
                ) : (
                  <Typography
                    element="subtitle-2"
                    weight="bold"
                    className="tw-text-natural-50 tw-flex tw-justify-center tw-items-center tw-h-full"
                  >
                    {arr.length - 4}
                    {"+"}
                  </Typography>
                )}
              </div>
            );
        })}
      </div>
      <RatingStars readonly rating={value} variant="md" />
      <div className="tw-flex tw-flex-wrap tw-justify-center">
        <Typography
          element="body"
          weight="bold"
          className="tw-text-natural-950 tw-text-center"
        >
          {raterNames}
        </Typography>
      </div>
      <div
        className={cn(
          "tw-bg-brand-500 tw-w-[123px] tw-h-[124px] tw-rounded-full",
          "tw-flex tw-flex-col tw-justify-center tw-items-center",
          "tw-border-[2px] tw-border-natural-200"
        )}
      >
        <Quote width={52.72} height={52.72} />
      </div>
    </div>
  );
};

export default TutorRatingCardGroup;
