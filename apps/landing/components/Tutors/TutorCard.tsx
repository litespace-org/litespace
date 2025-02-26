"use client";

import React, { useMemo } from "react";
import cn from "classnames";
import { Avatar } from "@litespace/ui/Avatar";
import { Typography } from "@litespace/ui/Typography";
import { orUndefined } from "@litespace/utils";
import Link from "next/link";
import { useFormatMessage } from "@/hooks/intl";
import { Tooltip } from "@litespace/ui/Tooltip";
import { formatNumber } from "@litespace/ui/utils";
import SStar from "@litespace/assets/SStar";
import { isEmpty } from "lodash";
import { Button } from "@litespace/ui/Button";
import { redirect, useRouter } from "next/navigation";
import { Web } from "@litespace/utils/routes";
import { router } from "@/lib/routes";
import { IUser } from "@litespace/types";

const FRESH_TUTOR_MAX_TOPIC_COUNT = 7;
const TUTOR_MAX_TOPIC_COUNT = 3;

export const TutorCard: React.FC<{
  id: number;
  name: string | null;
  about: string | null;
  imageUrl?: string | null;
  profileUrl: string;
  studentCount: number;
  lessonCount: number;
  rating: number;
  topics: Array<string>;
}> = ({
  id,
  name,
  about,
  imageUrl,
  profileUrl,
  studentCount,
  lessonCount,
  rating,
  topics,
}) => {
  const intl = useFormatMessage();
  const nextRouter = useRouter();

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
        "tw-h-full tw-bg-natural-50 tw-flex tw-gap-4",
        "tw-border tw-border-transparent hover:tw-border hover:tw-border-natural-100",
        "tw-p-4 tw-shadow-ls-small tw-rounded-lg"
      )}
    >
      <div className="tw-rounded-lg tw-overflow-hidden tw-shrink-0 tw-w-[200px]">
        <Avatar
          src={orUndefined(imageUrl)}
          alt={orUndefined(name)}
          seed={id.toString()}
          object="cover"
        />
      </div>
      <div className="tw-flex tw-flex-col">
        <Typography
          tag="h1"
          className="tw-text-brand-700 tw-mb-1 tw-line-clamp-1 tw-font-bold tw-text-subtitle-1"
        >
          {name}
        </Typography>

        <Typography
          tag="p"
          className="tw-ellipsis tw-line-clamp-2 tw-text-natural-800 tw-font-regular tw-text-caption"
        >
          {about}
        </Typography>

        <Link href={profileUrl} className="tw-cursor-pointer">
          <Typography
            tag="span"
            className="tw-ellipsis tw-line-clamp-2 tw-text-natural-800 tw-underline tw-text-caption tw-font-bold"
          >
            {intl("home/tutors/card-label-read-more")}
          </Typography>
        </Link>

        {!isFreshTutor ? (
          <div className={cn("tw-flex tw-gap-8 tw-my-4")}>
            {studentCount ? (
              <div className="tw-flex tw-flex-col tw-gap-1">
                <Typography
                  tag="span"
                  className="tw-text-natural-800 tw-text-caption tw-font-regular"
                >
                  {intl("home/tutors/card-label-students")}
                </Typography>
                <Typography
                  tag="span"
                  className="tw-text-natural-950 tw-font-semibold tw-text-body"
                >
                  {formatNumber(studentCount)}
                </Typography>
              </div>
            ) : null}

            {lessonCount ? (
              <div className="tw-flex tw-flex-col tw-gap-1">
                <Typography
                  tag="span"
                  className="tw-text-natural-800 tw-font-regular tw-text-caption"
                >
                  {intl("home/tutors/card-label-lessons")}
                </Typography>
                <Typography
                  tag="span"
                  className="tw-text-natural-950 tw-font-semibold tw-text-body"
                >
                  {formatNumber(lessonCount)}
                </Typography>
              </div>
            ) : null}

            {rating ? (
              <div className="tw-flex tw-flex-col tw-gap-1">
                <Typography
                  tag="span"
                  className="tw-text-natural-800 tw-text-caption tw-font-regular"
                >
                  {intl("home/tutors/card-label-rating")}
                </Typography>
                <div className="tw-flex tw-flex-row tw-items-center tw-gap-[5px] tw-h-full">
                  <Typography
                    tag="span"
                    className="tw-inline-block tw-text-natural-950 tw-font-semibold tw-text-tiny"
                  >
                    {rating}
                  </Typography>
                  <SStar
                    width={15}
                    height={15}
                    className="[&>*]:tw-fill-warning-500"
                  />
                </div>
              </div>
            ) : null}
          </div>
        ) : null}

        {!isEmpty(topics) && topics.join("").length > 0 ? (
          <div
            className={cn(
              "tw-flex tw-gap-2 tw-flex-wrap tw-justify-start tw-mb-4",
              { "tw-mt-4": isFreshTutor }
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
                      <Typography tag="span" className="tw-text-body">
                        {topic}
                      </Typography>
                    }
                  >
                    <div className="tw-w-16">
                      <Typography
                        tag="span"
                        className="tw-block tw-text-natural-50 tw-bg-brand-700 tw-px-3 tw-py-2 tw-rounded-3xl tw-text-center tw-truncate tw-font-regular tw-text-tiny"
                      >
                        {topic}
                      </Typography>
                    </div>
                  </Tooltip>
                );
            })}
            <Typography
              tag="span"
              className="tw-inline-block tw-text-natural-50 tw-bg-brand-700 tw-px-3 tw-py-2 tw-rounded-3xl tw-font-regular tw-text-tiny"
            >
              {remainingTopicsCount}
              {"+"}
            </Typography>
          </div>
        ) : null}

        <div className="tw-flex tw-gap-3 tw-mt-auto">
          <Link
            href={router.web({
              route: Web.Register,
              role: IUser.Role.Student,
              full: true,
              query: {
                redirect: redirect(
                  router.web({ route: Web.TutorProfile, id, full: true })
                ),
              },
            })}
          >
            <Button
              className="tw-grow tw-basis-1/2 tw-w-full"
              type="main"
              variant="primary"
              size="large"
            >
              <Typography
                tag="span"
                className="tw-text-natural-50 tw-font-semibold tw-text-caption"
              >
                {intl("home/tutors/card-book-button-label")}
              </Typography>
            </Button>
          </Link>
          <Link
            href={router.web({ route: Web.TutorProfile, id, full: true })}
            className={cn(
              "tw-block tw-grow tw-basis-1/2 tw-text-center tw-px-4 tw-py-2 tw-border tw-border-brand-700 tw-rounded-lg tw-w-full",
              "hover:tw-bg-brand-100 hover:tw-border-brand-700 focus:tw-bg-brand-200 focus:tw-ring-1 focus:tw-ring-brand-900",
              "tw-transition-colors tw-ease-out tw-duration-200"
            )}
          >
            <Typography
              tag="span"
              className="tw-text-brand-700 tw-font-semibold tw-text-caption"
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
