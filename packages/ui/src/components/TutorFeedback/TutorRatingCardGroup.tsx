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
        "p-4 md:p-6 bg-natural-50 rounded-3xl",
        "flex flex-col gap-6 justify-between items-center",
        "shadow-feedback-card"
      )}
    >
      <div className="flex -ml-4">
        {ratings.map((rating, idx, arr) => {
          const isLast = arr.length - idx === 1;
          if (idx <= 4)
            return (
              <div
                key={rating.userId}
                className={cn(
                  "md:w-[54px] w-[51px] h-[51px] md:h-[54px] rounded-full overflow-hidden border-[3px] border-brand-500 -mr-4 relative",
                  "felx justify-center items-center",
                  { "bg-brand-600": idx === 4 }
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
                    tag="span"
                    className="text-natural-50 flex justify-center items-center h-full font-bold text-subtitle-2"
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
      <div className="flex flex-wrap justify-center">
        <Typography
          tag="span"
          className="text-natural-950 text-center font-bold text-body md:text-caption"
        >
          {raterNames}
        </Typography>
      </div>
      <div
        className={cn(
          "bg-brand-500 w-[54px] h-[54px] md:w-[123px] md:h-[124px] rounded-full",
          "flex flex-col justify-center items-center",
          "border-[2px] border-natural-200"
        )}
      >
        <Quote
          width={52.72}
          height={52.72}
          className="md:w-[52.72px] md:h-[52.72px] w-6 h-6"
        />
      </div>
    </div>
  );
};

export default TutorRatingCardGroup;
