import React from "react";
import { Avatar } from "@/components/Avatar";
import { orUndefined } from "@litespace/utils/utils";
import { Typography } from "@/components/Typography";
import { useFormatMessage } from "@/hooks";
import Star from "@litespace/assets/Star";
import { Button } from "@/components/Button";
import { formatNumber } from "@/components/utils";
import { Void } from "@litespace/types";
import { Loader, LoadingError } from "@/components/Loading";
import cn from "classnames";

const ACHIEVEMENTS_DISPLAY_THRETHOLD = 5;

export const TutorProfileCard: React.FC<{
  image: string | null;
  name: string | null;
  id: number;
  bio: string | null;
  studentCount: number;
  lessonCount: number;
  avgRating: number;
  /**
   * Small in tutor settings page and large in tutor profile page
   */
  variant?: "small" | "large";
  onBook?: Void;
  loading?: boolean;
  error?: boolean;
  mq?: "default" | "sm" | "md";
  retry?: Void;
}> = ({
  image,
  name,
  id,
  bio,
  studentCount,
  lessonCount,
  avgRating,
  variant = "large",
  onBook,
  loading,
  error,
  retry,
  mq = "default",
}) => {
  const intl = useFormatMessage();

  if (loading)
    return (
      <div className="tw-h-full tw-flex tw-mt-[54px] tw-justify-center tw-items-center">
        <Loader size="medium" text={intl("tutor.profile.loading")} />
      </div>
    );

  if (error && retry)
    return (
      <div className="tw-h-full tw-flex tw-mt-[54px] tw-justify-center tw-items-center">
        <LoadingError
          size="medium"
          error={intl("tutor.profile.error")}
          retry={retry}
        />
      </div>
    );

  return (
    <div
      className={cn(
        "tw-grid tw-grid-cols-[auto,1fr] md:tw-flex tw-items-center max-w-[280px]",
        {
          "tw-gap-4 md:tw-gap-10 md:tw-p-10 md:tw-pb-0": variant === "large",
          "tw-gap-4": variant === "small",
        }
      )}
    >
      <div
        className={cn(
          "tw-aspect-square tw-shrink-0 tw-rounded-full tw-overflow-hidden",
          {
            "tw-w-[90px] tw-h-[90px] md:tw-h-[242px] md:tw-w-[242px]":
              variant === "large",
            "tw-w-[174px]": variant === "small",
          }
        )}
      >
        <Avatar
          src={orUndefined(image)}
          alt={orUndefined(name)}
          seed={id.toString()}
        />
      </div>

      <div className="md:tw-flex md:tw-flex-col ">
        <div
          className={cn("tw-flex tw-flex-col", {
            "tw-gap-1 md:tw-gap-2": variant === "large",
            "tw-gap-1": variant === "small",
          })}
        >
          <Typography
            element={{ default: "body", md: "h2" }}
            weight="bold"
            className="tw-text-natural-950 dark:tw-text-natural-50"
          >
            {name}
          </Typography>
          <div className="tw-flex tw-flex-col tw-gap-1">
            <Typography
              element={{ default: "tiny-text", md: "subtitle-2" }}
              weight="semibold"
              className="tw-text-natural-950 dark:tw-text-natural-50"
            >
              {bio}
            </Typography>
            {studentCount >= ACHIEVEMENTS_DISPLAY_THRETHOLD ? (
              <Typography
                element={{ default: "tiny-text", md: "subtitle-2" }}
                weight="semibold"
                className="tw-text-natural-950 dark:tw-text-natural-50"
              >
                {intl("tutor.achievements", {
                  lessonCount: formatNumber(lessonCount),
                  studentCount: formatNumber(studentCount),
                })}
              </Typography>
            ) : null}
          </div>
          {avgRating > 0 ? (
            <div className="tw-flex tw-items-center tw-gap-2">
              <Typography
                element={{ default: "tiny-text", md: "subtitle-2" }}
                weight="semibold"
                className="tw-text-natural-950 dark:tw-text-natural-50"
              >
                {formatNumber(avgRating, {
                  maximumFractionDigits: 1,
                })}
              </Typography>
              <div className="tw-w-4 tw-h-4 md:tw-w-[30px] md:tw-h-[30px]">
                <Star className="[&>*]:tw-fill-warning-500" />
              </div>
            </div>
          ) : null}
        </div>
        {onBook && mq === "md" ? (
          <Button onClick={onBook} className="tw-mt-auto !tw-w-[301px]">
            {intl("tutor.book")}
          </Button>
        ) : null}
      </div>

      {onBook && mq === "default" ? (
        <Button
          size="small"
          onClick={onBook}
          className="tw-w-full tw-max-w-[393px] tw-col-span-2 "
        >
          <Typography
            element={{ default: "caption", lg: "body" }}
            weight={{ default: "semibold", lg: "medium" }}
            className="tw-text-natural-50"
          >
            {intl("tutor.book")}
          </Typography>
        </Button>
      ) : null}
    </div>
  );
};

export default TutorProfileCard;
