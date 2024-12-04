import React from "react";
import { Avatar } from "@/components/Avatar";
import { orUndefined } from "@litespace/sol/utils";
import { Typography } from "@/components/Typography";
import { useFormatMessage } from "@/hooks";
import Star from "@litespace/assets/Star";
import { Button } from "@/components/Button";
import { formatNumber } from "@/components/utils";
import { Void } from "@litespace/types";

const ACHIEVEMENTS_DISPLAY_THRETHOLD = 5;

export const TutorProfileCard: React.FC<{
  imageUrl: string | null;
  name: string | null;
  id: number;
  bio: string | null;
  studentCount: number;
  lessonCount: number;
  rating: number;
  onBook?: Void;
}> = ({
  imageUrl,
  name,
  id,
  bio,
  studentCount,
  lessonCount,
  rating,
  onBook,
}) => {
  const intl = useFormatMessage();
  return (
    <div className="tw-flex tw-gap-10 tw-items-center">
      <div className="tw-w-[242px] tw-aspect-square tw-rounded-full tw-overflow-hidden">
        <Avatar
          src={orUndefined(imageUrl)}
          alt={orUndefined(name)}
          seed={id.toString()}
        />
      </div>
      <div>
        <div className="tw-flex tw-flex-col tw-gap-2">
          <Typography
            element="h2"
            className="tw-font-bold tw-text-natural-950 dark:tw-text-natural-50"
          >
            {name}
          </Typography>
          <div className="tw-flex tw-flex-col tw-gap-1">
            <Typography
              element="subtitle-2"
              className="tw-text-natural-950 tw-font-semibold dark:tw-text-natural-50"
            >
              {bio}
            </Typography>
            {studentCount >= ACHIEVEMENTS_DISPLAY_THRETHOLD ? (
              <Typography
                element="subtitle-2"
                className="tw-text-natural-950 tw-font-semibold dark:tw-text-natural-50"
              >
                {intl("tutor.achievements", {
                  lessonCount: formatNumber(lessonCount),
                  studentCount: formatNumber(studentCount),
                })}
              </Typography>
            ) : null}
          </div>
          {rating === 0 ? (
            <div className="tw-flex tw-items-center tw-gap-2">
              <Typography
                element="subtitle-2"
                className="tw-text-natural-950 tw-font-semibold dark:tw-text-natural-50"
              >
                {formatNumber(rating, {
                  maximumFractionDigits: 1,
                })}
              </Typography>
              <Star className="[&>*]:tw-fill-warning-500" />
            </div>
          ) : null}
        </div>
        <Button onClick={onBook} className="tw-mt-3 !tw-w-[301px]">
          {intl("tutor.book")}
        </Button>
      </div>
    </div>
  );
};

export default TutorProfileCard;
