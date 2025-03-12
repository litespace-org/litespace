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
        "h-full bg-natural-50 flex gap-4",
        "border border-transparent hover:border hover:border-natural-100",
        "p-4 shadow-ls-small rounded-lg"
      )}
    >
      <div className="rounded-lg overflow-hidden shrink-0 w-[200px]">
        <Avatar
          src={orUndefined(imageUrl)}
          alt={orUndefined(name)}
          seed={id.toString()}
        />
      </div>
      <div className="flex flex-col">
        <Typography
          tag="h1"
          className="text-brand-700 mb-1 line-clamp-1 font-bold text-subtitle-1"
        >
          {name}
        </Typography>

        <Typography
          tag="p"
          className="ellipsis line-clamp-2 text-natural-800 font-normal text-caption"
        >
          {about}
        </Typography>

        <Link to={profileUrl} className="cursor-pointer">
          <Typography
            tag="span"
            className="ellipsis line-clamp-2 text-natural-800 underline text-caption font-bold"
          >
            {intl("tutors.card.label.read-more")}
          </Typography>
        </Link>

        {!isFreshTutor ? (
          <div className={cn("flex gap-8 my-4")}>
            {studentCount ? (
              <div className="flex flex-col gap-1">
                <Typography
                  tag="span"
                  className="text-natural-800 text-caption font-normal"
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
              <div className="flex flex-col gap-1">
                <Typography
                  tag="span"
                  className="text-natural-800 font-normal text-caption"
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
              <div className="flex flex-col gap-1">
                <Typography
                  tag="span"
                  className="text-natural-800 text-caption font-normal"
                >
                  {intl("tutors.card.label.rating")}
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

        {!isEmpty(topics) ? (
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
                    content={
                      <Typography tag="span" className="text-body">
                        {topic}
                      </Typography>
                    }
                  >
                    <div className="w-24">
                      <Typography
                        tag="span"
                        className="block text-natural-50 bg-brand-700 px-3 py-2 rounded-3xl text-center truncate font-normal text-tiny"
                      >
                        {topic}
                      </Typography>
                    </div>
                  </Tooltip>
                );
            })}
            {remainingTopicsCount ? (
              <Typography
                tag="span"
                className="inline-block text-natural-50 bg-brand-700 px-3 py-2 rounded-3xl font-normal text-tiny"
              >
                {remainingTopicsCount}+
              </Typography>
            ) : null}
          </div>
        ) : null}

        <div className="flex gap-3 mt-auto">
          <Button
            onClick={onBook}
            className="grow basis-1/2 w-full"
            type="main"
            variant="primary"
            size="large"
          >
            <Typography
              tag="span"
              className="text-natural-50 font-semibold text-caption"
            >
              {intl("tutors.card.book-button.label")}
            </Typography>
          </Button>
          <Link to={profileUrl} className="grow basis-1/2">
            <Button variant="secondary" size="large" className="w-full">
              <Typography
                tag="span"
                className="text-brand-700 font-semibold text-caption"
              >
                {intl("tutors.card.profile-button.label")}
              </Typography>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TutorCardV1;
