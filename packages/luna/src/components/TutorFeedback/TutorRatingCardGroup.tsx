import { RatingStars } from "@/components/RatingStars";
import { TutorRatingCardGroupProps } from "@/components/TutorFeedback/types";
import Quote from "@litespace/assets/Quote";
import { orUndefined } from "@litespace/sol/utils";
import cn from "classnames";
import React from "react";
import { Avatar } from "@/components/Avatar";
import { Typography } from "@/components/Typography";
import { useFormatMessage } from "@/hooks";

export const TutorRatingCardGroup: React.FC<TutorRatingCardGroupProps> = ({
  ratings,
  value,
}) => {
  const intl = useFormatMessage();

  return (
    <div
      className={cn(
        "tw-h-[383px] tw-p-6 tw-bg-natural-50 tw-rounded-3xl",
        "tw-flex tw-flex-col tw-justify-between tw-items-center"
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
                  { "tw-bg-brand-500": idx === 4 }
                )}
                style={{ zIndex: arr.length - idx }}
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
        {ratings.map((rating, idx, arr) => {
          const isLast = arr.length - idx === 1;
          const others = arr.length - idx;
          const separator = () => {
            if (idx < 2 && !isLast) return "،";
            if (idx === 2 && !isLast) return " " + "و";
            return "";
          };
          return (
            <Typography
              element="body"
              weight="bold"
              className="tw-text-natural-950 tw-text-center"
            >
              {idx <= 2 ? rating.name + separator() : null}
              {idx === 3 && others > 1
                ? separator() +
                  others +
                  intl("tutor.rating.group-names.suffix.pleural")
                : null}
              {idx === 3 && others === 1
                ? separator() +
                  others +
                  intl("tutor.rating.group-names.suffix.singluar")
                : null}
              &nbsp;
            </Typography>
          );
        })}
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
