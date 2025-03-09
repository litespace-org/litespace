import React, { useMemo } from "react";
import { orUndefined } from "@litespace/utils/utils";
import Star from "@litespace/assets/Star";
import { Void } from "@litespace/types";
import cn from "classnames";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Loader, LoadingError } from "@litespace/ui/Loading";
import { Avatar } from "@litespace/ui/Avatar";
import { Typography } from "@litespace/ui/Typography";
import { formatNumber } from "@litespace/ui/utils";
import { Button } from "@litespace/ui/Button";
import { useMediaQuery } from "@litespace/headless/mediaQuery";

const ACHIEVEMENTS_DISPLAY_THRETHOLD = 5;

export const ProfileCard: React.FC<{
  image: string | null;
  name: string | null;
  id: number;
  bio: string | null;
  studentCount: number;
  lessonCount: number;
  avgRating: number;
  onBook?: Void;
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
  onBook,
  retry,
}) => {
  const intl = useFormatMessage();
  const { sm } = useMediaQuery();

  const BookButton = useMemo(
    () => (
      <Button
        size="large"
        onClick={onBook}
        className="w-full max-w-[360px] sm:max-w-[289px]"
      >
        <Typography
          tag="span"
          className="text-caption md:text-body font-semibold md:font-medium"
        >
          {intl("tutor.book")}
        </Typography>
      </Button>
    ),
    [intl, onBook]
  );

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
        "md:pt-10 md:px-10 flex flex-col gap-4 sm:gap-0 items-stretch w-full"
      )}
    >
      <div className="flex gap-4 md:gap-10 lg:justify-start">
        <div
          className={cn(
            "aspect-square shrink-0 rounded-full overflow-hidden",
            "w-[90px] h-[90px] md:w-[242px] md:h-[242px]"
          )}
        >
          <Avatar
            src={orUndefined(image)}
            alt={orUndefined(name)}
            seed={id.toString()}
          />
        </div>

        <div className="sm:flex sm:flex-col w-full sm:gap-5 min-w-max">
          <div className="flex flex-col gap-1 md:gap-2">
            <Typography
              tag="h3"
              className="font-bold text-natural-950 dark:text-natural-50 text-body md:text-h2"
            >
              {name}
            </Typography>
            <div className="flex flex-col gap-1 md:gap-2">
              <Typography
                tag="span"
                className="inline-block font-semibold text-natural-950 text-tiny md:text-subtitle-2"
              >
                {bio}
              </Typography>
              {studentCount >= ACHIEVEMENTS_DISPLAY_THRETHOLD ? (
                <Typography
                  tag="span"
                  className="inline-block text-natural-950 dark:text-natural-50 font-semibold text-tiny md:text-subtitle-2"
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
                  className="font-normal md:font-semibold text-tiny md:text-body lg:text-subtitle-2 text-natural-950 dark:text-natural-50 inline-block md:-mt-1"
                >
                  {formatNumber(avgRating, {
                    maximumFractionDigits: 1,
                  })}
                </Typography>
                <Star className="w-4 h-4 md:w-[30px] md:h-[30px] [&>*]:fill-warning-500" />
              </div>
            ) : null}
          </div>
          {sm ? BookButton : null}
        </div>
      </div>
      {!sm ? BookButton : null}
    </div>
  );
};

export default ProfileCard;
