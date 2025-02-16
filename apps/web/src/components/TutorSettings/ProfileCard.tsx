import React from "react";
import { orUndefined } from "@litespace/utils/utils";
import Star from "@litespace/assets/Star";
import { Void } from "@litespace/types";
import cn from "classnames";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Loader, LoadingError } from "@litespace/ui/Loading";
import { Avatar } from "@litespace/ui/Avatar";
import { Typography } from "@litespace/ui/Typography";
import { formatNumber } from "@litespace/ui/utils";

const ACHIEVEMENTS_DISPLAY_THRETHOLD = 5;

export const ProfileCard: React.FC<{
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
  // variant?: "small" | "large";
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
  loading,
  error,
  retry,
}) => {
  const intl = useFormatMessage();

  if (loading)
    return (
      <div className="h-full flex mt-[54px] justify-center items-center">
        <Loader size="medium" text={intl("tutor.profile.loading")} />
      </div>
    );

  if (error && retry)
    return (
      <div className="h-full flex mt-[54px] justify-center items-center">
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
        "flex gap-4 items-stretch md:justify-between lg:justify-start"
      )}
    >
      <div
        className={cn(
          "aspect-square shrink-0 rounded-full overflow-hidden",
          "w-[84px] h-[84px] md:w-[150px] md:h-[150px] lg:w-[174px] lg:h-[174px]"
        )}
      >
        <Avatar
          src={orUndefined(image)}
          alt={orUndefined(name)}
          seed={id.toString()}
        />
      </div>

      <div className="md:flex md:flex-col w-full md:max-w-[235px] lg:max-w-[416px]">
        <div className={cn("flex flex-col md:gap-1")}>
          <Typography
            element={{ default: "subtitle-2", md: "h3", lg: "h2" }}
            weight="bold"
            className="text-natural-950 dark:text-natural-50"
          >
            {name}
          </Typography>
          <div className="flex flex-col gap-1">
            <Typography
              element={{ default: "tiny-text", md: "body", lg: "subtitle-2" }}
              weight="semibold"
              className="text-natural-950"
            >
              {bio}
            </Typography>
            {studentCount >= ACHIEVEMENTS_DISPLAY_THRETHOLD ? (
              <Typography
                element={{ default: "tiny-text", md: "subtitle-2" }}
                weight="semibold"
                className="text-natural-950 dark:text-natural-50"
              >
                {intl("tutor.achievements", {
                  lessonCount: formatNumber(lessonCount),
                  studentCount: formatNumber(studentCount),
                })}
              </Typography>
            ) : null}
          </div>
          {avgRating > 0 ? (
            <div className="flex items-center gap-2">
              <Typography
                element={{ default: "tiny-text", md: "body", lg: "subtitle-2" }}
                weight={{ default: "regular", md: "semibold" }}
                className="text-natural-950 dark:text-natural-50"
              >
                {formatNumber(avgRating, {
                  maximumFractionDigits: 1,
                })}
              </Typography>
              <Star className="w-4 h-4 md:w-[30px] md:h-[30px] [&>*]:fill-warning-500" />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
