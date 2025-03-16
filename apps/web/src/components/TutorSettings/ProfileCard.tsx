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
  loading?: boolean;
  error?: boolean;
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
          object="cover"
        />
      </div>

      <div className="md:flex md:flex-col w-full md:max-w-[235px] lg:max-w-[416px]">
        <div className={cn("flex flex-col md:gap-1")}>
          <Typography
            tag="h3"
            className="font-bold text-natural-950 dark:text-natural-50 text-subtitle-2 md:text-h3 lg:text-h2"
          >
            {name}
          </Typography>
          <div className="flex flex-col gap-1">
            <Typography
              tag="span"
              className="inline-block font-semibold text-natural-950 text-tiny md:text-body lg:text-subtitle-2"
            >
              {bio}
            </Typography>
            {studentCount >= ACHIEVEMENTS_DISPLAY_THRETHOLD ? (
              <Typography
                tag="span"
                className="inline-block font-semibold text-natural-950 dark:text-natural-50 text-tiny md:text-subtitle-2"
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
                tag="span"
                className="inline-block text-natural-950 dark:text-natural-50 font-normal md:font-semibold text-tiny md:text-body lg:text-subtitle-2"
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
