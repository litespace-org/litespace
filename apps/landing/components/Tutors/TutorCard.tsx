"use client";

import SStar from "@litespace/assets/SStar";
import { orUndefined } from "@litespace/utils/utils";
import cn from "classnames";
import { isEmpty } from "lodash";
import React, { useMemo } from "react";
import { useFormatMessage } from "@/hooks/intl";
import { Avatar } from "@litespace/ui/Avatar";
import { Typography } from "@litespace/ui/Typography";
import { formatNumber } from "@litespace/ui/utils";
import { Tooltip } from "@litespace/ui/Tooltip";
import { Button } from "@litespace/ui/Button";
import Link from "next/link";

const FRESH_TUTOR_MAX_TOPIC_COUNT = 7;
const TUTOR_MAX_TOPIC_COUNT = 3;

export const TutorCard: React.FC<{
  id: number;
  name: string | null;
  bio: string | null;
  about: string | null;
  imageUrl: string | null;
  lessonCount: number;
  studentCount: number;
  rating: number;
  profileUrl: string;
  topics: Array<string>;
}> = ({
  id,
  name,
  bio,
  about,
  imageUrl,
  lessonCount,
  studentCount,
  profileUrl,
  rating,
  topics,
}) => {
  const intl = useFormatMessage();
  const isFreshTutor = useMemo(
    () => !studentCount && !lessonCount && !rating,
    [lessonCount, rating, studentCount]
  );

  const remainingTopicsCount = useMemo(() => {
    const displayedCount = !isFreshTutor
      ? FRESH_TUTOR_MAX_TOPIC_COUNT
      : TUTOR_MAX_TOPIC_COUNT;
    const totalTopics = topics.length;

    const remainingTopicsCount =
      totalTopics < displayedCount ? 0 : totalTopics - displayedCount;

    return remainingTopicsCount;
  }, [isFreshTutor, topics]);

  return (
    <div
      className={cn(
        "h-full bg-natural-50 flex gap-2 md:gap-4",
        "border border-transparent hover:border hover:border-natural-100",
        "p-4 shadow-ls-small rounded-lg"
      )}
    >
      <div className="rounded-lg overflow-hidden shrink-0 w-[58px] h-[58px] md:h-auto md:w-[200px]">
        <Avatar
          src={orUndefined(imageUrl)}
          alt={orUndefined(name)}
          seed={id.toString()}
          object="cover"
        />
      </div>
      <div className="flex flex-col">
        <Typography
          tag="h3"
          className="text-brand-700 mb-[2px] md:mb-1 line-clamp-1 font-bold text-caption md:text-subtitle-1"
        >
          {name}
        </Typography>

        {bio ? (
          <Typography
            tag="p"
            className="ellipsis line-clamp-2 text-natural-800 font-normal text-tiny md:text-caption h-[35px] md:h-auto"
          >
            {bio}
          </Typography>
        ) : null}

        <Typography
          tag="p"
          className="-ms-[66px] md:ms-0 mt-2 md:mt-0 ellipsis line-clamp-2 text-natural-800 font-normal text-caption"
        >
          {about}
        </Typography>

        <Link href={profileUrl} className="cursor-pointer -ms-[66px] md:ms-0">
          <Typography
            tag="span"
            className="ellipsis line-clamp-2 text-natural-950 underline text-caption font-semibold md:font-bold"
          >
            {intl("home/tutors/card-label-read-more")}
          </Typography>
        </Link>

        {!isFreshTutor ? (
          <div className={cn("flex gap-8 my-2 md:my-4 -ms-[66px] md:ms-0")}>
            {studentCount ? (
              <div className="flex flex-col gap-1">
                <Typography
                  tag="span"
                  className="text-natural-800 text-caption font-normal"
                >
                  {intl("home/tutors/card-label-students")}
                </Typography>
                <Typography
                  tag="span"
                  className="text-natural-950 font-semibold text-body"
                >
                  {formatNumber(studentCount)}
                </Typography>
              </div>
            ) : null}

            {lessonCount ? (
              <div className="flex flex-col gap-1">
                <Typography
                  tag="span"
                  className="text-natural-800 font-regular text-caption"
                >
                  {intl("home/tutors/card-label-lessons")}
                </Typography>
                <Typography
                  tag="span"
                  className="text-natural-950 font-semibold text-body"
                >
                  {formatNumber(lessonCount)}
                </Typography>
              </div>
            ) : null}

            {rating ? (
              <div className="flex flex-col gap-1">
                <Typography
                  tag="span"
                  className="text-natural-800 text-caption font-regular"
                >
                  {intl("home/tutors/card-label-rating")}
                </Typography>
                <div className="flex flex-row items-center gap-[5px] h-full">
                  <Typography
                    tag="span"
                    className="inline-block text-natural-950 font-semibold text-tiny"
                  >
                    {rating}
                  </Typography>
                  <SStar
                    width={15}
                    height={15}
                    className="[&>*]:fill-warning-500"
                  />
                </div>
              </div>
            ) : null}
          </div>
        ) : null}

        {!isEmpty(topics) && topics.join("").length > 0 ? (
          <div
            className={cn(
              "flex gap-2 flex-wrap justify-start mb-2 md:mb-4 -ms-[66px] md:ms-0",
              {
                "mt-4": isFreshTutor,
              }
            )}
          >
            {topics.map((topic, idx) => {
              if (
                (isFreshTutor && idx < FRESH_TUTOR_MAX_TOPIC_COUNT) ||
                (!isFreshTutor && idx < TUTOR_MAX_TOPIC_COUNT)
              )
                return (
                  <Tooltip
                    key={idx}
                    content={
                      <Typography tag="span" className="text-body">
                        {topic}
                      </Typography>
                    }
                  >
                    <div className="w-16">
                      <Typography
                        tag="span"
                        className="block text-natural-50 bg-brand-700 px-3 py-2 rounded-3xl text-center truncate font-normal md:font-semibold text-tiny md:text-caption"
                      >
                        {topic}
                      </Typography>
                    </div>
                  </Tooltip>
                );
            })}
            <Typography
              tag="span"
              className="inline-block text-natural-50 bg-brand-700 px-3 py-2 rounded-3xl font-regular text-tiny"
            >
              {remainingTopicsCount}
              {"+"}
            </Typography>
          </div>
        ) : null}

        <div className="flex flex-row gap-3 mt-auto -ms-[66px] md:ms-0">
          <Button className="w-full" type="main" variant="primary" size="large">
            <Link href={profileUrl}>
              <Typography
                tag="label"
                className="text-caption font-semibold lg:text-body lg:font-medium"
              >
                {intl("home/tutors/card-book-button-label")}
              </Typography>
            </Link>
          </Button>
          <Link
            href={profileUrl}
            className={cn(
              "w-full flex items-center justify-center text-base",
              "text-center px-4 py-2 border border-brand-700 rounded-lg",
              "hover:bg-brand-100 hover:border-brand-700",
              "focus:bg-brand-200 focus:ring-1 focus:ring-brand-900",
              "transition-colors ease-out duration-200"
            )}
          >
            <Typography
              tag="span"
              className="text-brand-700 text-caption font-semibold lg:text-body lg:font-medium"
            >
              {intl("home/tutors/card-profile-button-label")}
            </Typography>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TutorCard;
