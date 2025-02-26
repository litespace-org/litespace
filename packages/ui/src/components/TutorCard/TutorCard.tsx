import React, { useMemo } from "react";
import cn from "classnames";
import { Avatar } from "@/components/Avatar";
import { Typography } from "@/components/Typography";
import { Button } from "@/components/Button";
import Star from "@litespace/assets/Star";
import { useFormatMessage } from "@/hooks";
import { formatNumber } from "@/components/utils";
import { Link } from "react-router-dom";
import { orUndefined } from "@litespace/utils/utils";
import { Tooltip } from "@/components/Tooltip";
import { CardProps } from "@/components/TutorCard/types";
import { isEmpty } from "lodash";

const FRESH_TUTOR_MAX_TOPIC_COUNT = 7;
const TUTOR_MAX_TOPIC_COUNT = 3;

export const TutorCard: React.FC<CardProps> = ({
  id,
  name,
  bio,
  about,
  imageUrl,
  lessonCount,
  studentCount,
  profileUrl,
  rating,
  onBook,
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
        "tw-flex tw-flex-col",
        "tw-bg-natural-50 tw-border tw-border-natural-100",
        "tw-px-4 tw-py-[0.906rem] tw-shadow-ls-x-small tw-rounded-lg"
      )}
    >
      <div className="tw-flex tw-flex-row tw-gap-2 tw-mb-2">
        <div className="tw-rounded-lg tw-overflow-hidden tw-shrink-0 tw-w-[58px] tw-h-[58px]">
          <Avatar
            src={orUndefined(imageUrl)}
            alt={orUndefined(name)}
            seed={id.toString()}
          />
        </div>
        <div>
          <Typography
            tag="span"
            className="tw-text-brand-700 tw-mb-0.5 tw-line-clamp-1 tw-font-bold tw-text-caption"
          >
            {name}
          </Typography>

          <Typography
            tag="p"
            className="tw-ellipsis tw-line-clamp-2 tw-text-natural-800 tw-text-tiny"
          >
            {bio}
          </Typography>
        </div>
      </div>

      <Typography
        tag="p"
        className="tw-ellipsis tw-line-clamp-2 tw-text-natural-800 tw-font-medium tw-text-caption"
      >
        {about}
      </Typography>

      <Link to={profileUrl} className="tw-cursor-pointer">
        <Typography
          tag="span"
          className="tw-ellipsis tw-line-clamp-2 tw-text-natural-950 tw-underline tw-font-semibold tw-text-caption"
        >
          {intl("tutors.card.label.read-more")}
        </Typography>
      </Link>

      {!isFreshTutor ? (
        <div className={cn("tw-flex tw-gap-8 tw-my-4")}>
          {studentCount ? (
            <div className="tw-flex tw-flex-col tw-gap-1 tw-w-[46px]">
              <Typography
                tag="span"
                className="tw-text-natural-800 tw-font-regular tw-text-tiny"
              >
                {intl("tutors.card.label.students")}
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
            <div className="tw-flex tw-flex-col tw-gap-1 tw-w-[46px]">
              <Typography
                tag="span"
                className="tw-text-natural-800 tw-font-regular tw-text-tiny"
              >
                {intl("tutors.card.label.lessons")}
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
            <div className="tw-flex tw-flex-col tw-gap-1 tw-w-[46px]">
              <Typography
                tag="span"
                className="tw-text-natural-800 tw-font-regular tw-text-tiny"
              >
                {intl("tutors.card.label.rating")}
              </Typography>
              <div className="tw-flex tw-flex-row tw-items-center tw-gap-[5px] tw-h-full">
                <Typography
                  tag="span"
                  className="tw-inline-block tw-text-natural-950 tw-font-semibold tw-text-body"
                >
                  {rating}
                </Typography>
                <Star
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
                  content={<Typography tag="span">{topic}</Typography>}
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

      <div className="tw-flex tw-flex-row tw-gap-3">
        <Button
          onClick={onBook}
          className="tw-w-full"
          type="main"
          variant="primary"
          size="large"
        >
          {intl("tutors.card.book-button.label")}
        </Button>
        <Link
          to={profileUrl}
          className={cn(
            "tw-w-full tw-flex tw-items-center tw-justify-center tw-text-base",
            "tw-text-center tw-px-4 tw-py-2 tw-border tw-border-brand-700 tw-rounded-lg",
            "hover:tw-bg-brand-100 hover:tw-border-brand-700",
            "focus:tw-bg-brand-200 focus:tw-ring-1 focus:tw-ring-brand-900",
            "tw-transition-colors tw-ease-out tw-duration-200"
          )}
        >
          <Typography
            tag="span"
            className="tw-text-brand-700 tw-text-caption tw-font-semibold"
          >
            {intl("tutors.card.profile-button.label")}
          </Typography>
        </Link>
      </div>
    </div>
  );
};
