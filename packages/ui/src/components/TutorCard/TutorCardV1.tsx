import { Avatar } from "@/components/Avatar";
import { Button } from "@/components/Button";
import { CardProps } from "@/components/TutorCard/types";
import { Typography } from "@/components/Typography";
import { formatNumber } from "@/components/utils";
import { useFormatMessage } from "@/hooks";
import SStar from "@litespace/assets/SStar";
import { orUndefined } from "@litespace/utils/utils";
import cn from "classnames";
import { isEmpty } from "lodash";
import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { Tooltip } from "@/components/Tooltip";

const FRESH_TUTOR_MAX_TOPIC_COUNT = 7;
const TUTOR_MAX_TOPIC_COUNT = 3;

export const TutorCardV1: React.FC<CardProps> = ({
  id,
  name,
  about,
  imageUrl,
  lessonCount,
  studentCount,
  profileUrl,
  rating,
  topics,
  onBook,
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
          element="subtitle-1"
          weight="bold"
          className="tw-text-brand-700 tw-mb-1 tw-line-clamp-1"
        >
          {name}
        </Typography>

        <Typography
          element="caption"
          weight="regular"
          className="tw-ellipsis tw-line-clamp-2 tw-text-natural-800"
        >
          {about}
        </Typography>

        <Link to={profileUrl} className="tw-cursor-pointer">
          <Typography
            element="caption"
            weight="bold"
            className="tw-ellipsis tw-line-clamp-2 tw-text-natural-800 tw-underline"
          >
            {intl("tutors.card.label.read-more")}
          </Typography>
        </Link>

        {!isFreshTutor ? (
          <div className={cn("tw-flex tw-gap-8 tw-my-4")}>
            {studentCount ? (
              <div className="tw-flex tw-flex-col tw-gap-1">
                <Typography
                  element="caption"
                  weight="regular"
                  className="tw-text-natural-800"
                >
                  {intl("tutors.card.label.students")}
                </Typography>
                <Typography
                  element="body"
                  weight="semibold"
                  className="tw-text-natural-950"
                >
                  {formatNumber(studentCount)}
                </Typography>
              </div>
            ) : null}

            {lessonCount ? (
              <div className="tw-flex tw-flex-col tw-gap-1">
                <Typography
                  element="caption"
                  weight="regular"
                  className="tw-text-natural-800"
                >
                  {intl("tutors.card.label.lessons")}
                </Typography>
                <Typography
                  element="body"
                  weight="semibold"
                  className="tw-text-natural-950"
                >
                  {formatNumber(lessonCount)}
                </Typography>
              </div>
            ) : null}

            {rating ? (
              <div className="tw-flex tw-flex-col tw-gap-1">
                <Typography
                  element="caption"
                  weight="regular"
                  className="tw-text-natural-800"
                >
                  {intl("tutors.card.label.rating")}
                </Typography>
                <div className="tw-flex tw-flex-row tw-items-center tw-gap-[5px] tw-h-full">
                  <Typography
                    element="tiny-text"
                    weight="semibold"
                    className="tw-inline-block tw-text-natural-950"
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
                    content={<Typography element="body">{topic}</Typography>}
                  >
                    <div className="tw-w-16">
                      <Typography
                        element="tiny-text"
                        weight="regular"
                        className="tw-block tw-text-natural-50 tw-bg-brand-700 tw-px-3 tw-py-2 tw-rounded-3xl tw-text-center tw-truncate"
                      >
                        {topic}
                      </Typography>
                    </div>
                  </Tooltip>
                );
            })}
            <Typography
              element="tiny-text"
              weight="regular"
              className="tw-inline-block tw-text-natural-50 tw-bg-brand-700 tw-px-3 tw-py-2 tw-rounded-3xl"
            >
              {remainingTopicsCount}
              {"+"}
            </Typography>
          </div>
        ) : null}

        <div className="tw-flex tw-gap-3 tw-mt-auto">
          <Button
            onClick={onBook}
            className="tw-grow tw-basis-1/2 tw-w-full"
            type="main"
            variant="primary"
            size="large"
          >
            <Typography
              element="caption"
              weight="semibold"
              className="tw-text-natural-50"
            >
              {intl("tutors.card.book-button.label")}
            </Typography>
          </Button>
          <Link
            to={profileUrl}
            className={cn(
              "tw-block tw-grow tw-basis-1/2 tw-text-center tw-px-4 tw-py-2 tw-border tw-border-brand-700 tw-rounded-lg tw-w-full",
              "hover:tw-bg-brand-100 hover:tw-border-brand-700 focus:tw-bg-brand-200 focus:tw-ring-1 focus:tw-ring-brand-900",
              "tw-transition-colors tw-ease-out tw-duration-200"
            )}
          >
            <Typography
              element="caption"
              weight="semibold"
              className="tw-text-brand-700"
            >
              {intl("tutors.card.profile-button.label")}
            </Typography>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TutorCardV1;
