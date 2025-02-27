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
        "flex flex-col",
        "bg-natural-50 border border-natural-100",
        "px-4 py-[0.906rem] shadow-ls-x-small rounded-lg"
      )}
    >
      <div className="flex flex-row gap-2 mb-2">
        <div className="rounded-lg overflow-hidden shrink-0 w-[58px] h-[58px]">
          <Avatar
            src={orUndefined(imageUrl)}
            alt={orUndefined(name)}
            seed={id.toString()}
          />
        </div>
        <div>
          <Typography
            tag="span"
            className="text-brand-700 mb-0.5 line-clamp-1 font-bold text-caption"
          >
            {name}
          </Typography>

          <Typography
            tag="p"
            className="ellipsis line-clamp-2 text-natural-800 text-tiny"
          >
            {bio}
          </Typography>
        </div>
      </div>

      <Typography
        tag="p"
        className="ellipsis line-clamp-2 text-natural-800 font-medium text-caption"
      >
        {about}
      </Typography>

      <Link to={profileUrl} className="cursor-pointer">
        <Typography
          tag="span"
          className="ellipsis line-clamp-2 text-natural-950 underline font-semibold text-caption"
        >
          {intl("tutors.card.label.read-more")}
        </Typography>
      </Link>

      {!isFreshTutor ? (
        <div className={cn("flex gap-8 my-4")}>
          {studentCount ? (
            <div className="flex flex-col gap-1 w-[46px]">
              <Typography
                tag="span"
                className="text-natural-800 font-regular text-tiny"
              >
                {intl("tutors.card.label.students")}
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
            <div className="flex flex-col gap-1 w-[46px]">
              <Typography
                tag="span"
                className="text-natural-800 font-regular text-tiny"
              >
                {intl("tutors.card.label.lessons")}
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
            <div className="flex flex-col gap-1 w-[46px]">
              <Typography
                tag="span"
                className="text-natural-800 font-regular text-tiny"
              >
                {intl("tutors.card.label.rating")}
              </Typography>
              <div className="flex flex-row items-center gap-[5px] h-full">
                <Typography
                  tag="span"
                  className="inline-block text-natural-950 font-semibold text-body"
                >
                  {rating}
                </Typography>
                <Star
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
          className={cn("flex gap-2 flex-wrap justify-start mb-4", {
            "mt-4": isFreshTutor,
          })}
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
                  <div className="w-16">
                    <Typography
                      tag="span"
                      className="block text-natural-50 bg-brand-700 px-3 py-2 rounded-3xl text-center truncate font-regular text-tiny"
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

      <div className="flex flex-row gap-3">
        <Button
          onClick={onBook}
          className="w-full"
          type="main"
          variant="primary"
          size="large"
        >
          {intl("tutors.card.book-button.label")}
        </Button>
        <Link
          to={profileUrl}
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
            className="text-brand-700 text-caption font-semibold"
          >
            {intl("tutors.card.profile-button.label")}
          </Typography>
        </Link>
      </div>
    </div>
  );
};
