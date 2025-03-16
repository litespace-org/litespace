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
import Link from "@/components/Common/Link";

const FRESH_TUTOR_MAX_TOPIC_COUNT = 7;
const TUTOR_MAX_TOPIC_COUNT = 3;

export const TutorCard: React.FC<{
  id: number;
  name: string | null;
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
        "h-full bg-natural-50 flex gap-2 md:gap-4 max-w-[500px] md:max-w-[574px] lg:max-w-[600px]",
        "border border-transparent hover:border hover:border-natural-100",
        "p-4 shadow-tutor-card rounded-lg"
      )}
    >
      <div className="hidden md:block rounded-lg overflow-hidden shrink-0 w-[200px]">
        <Avatar src={imageUrl} alt={name} seed={id.toString()} />
      </div>
      <div className="flex flex-col">
        <div className="flex gap-2">
          <div className="block md:hidden w-[58px] h-[58px] rounded-lg overflow-hidden shrink-0">
            <Avatar
              src={orUndefined(imageUrl)}
              alt={orUndefined(name)}
              seed={id.toString()}
              object="fill"
            />
          </div>
          <Typography
            tag="h3"
            className="text-brand-700 mb-[2px] md:mb-1 line-clamp-1 font-bold text-caption md:text-subtitle-1"
          >
            {name}
          </Typography>
        </div>
        <Typography
          tag="p"
          className="mt-2 md:mt-0 ellipsis line-clamp-2 text-natural-800 font-normal text-caption"
        >
          {about}
        </Typography>

        <Link
          href={profileUrl}
          className="cursor-pointer w-fit"
          track={{
            event: "view_item",
            params: {
              action: "link",
              src: "tutor-card",
              label: about || "",
            },
          }}
        >
          <Typography
            tag="span"
            className="ellipsis line-clamp-2 text-natural-950 underline text-caption font-semibold md:font-bold"
          >
            {intl("home/tutors/card/read-more")}
          </Typography>
        </Link>

        {!isFreshTutor ? (
          <div className={cn("flex gap-8 my-2 md:my-4")}>
            {studentCount ? (
              <div className="flex flex-col gap-1">
                <Typography
                  tag="span"
                  className="text-natural-800 text-caption font-normal"
                >
                  {intl("home/tutors/card/students")}
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
                  {intl("home/tutors/card/lessons")}
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
                  {intl("home/tutors/card/rating")}
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
            className={cn("flex gap-2 flex-wrap justify-start", {
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
                        className="block text-natural-50 bg-brand-700 px-3 py-2 rounded-3xl text-center truncate font-normal md:font-semibold text-tiny md:text-caption"
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

        <div className="flex flex-row gap-3 mt-2 md:mt-4">
          <Link
            href={profileUrl}
            className="w-full block"
            track={{
              event: "book_lesson",
              params: {
                src: "turor-card",
                tutorId: id,
                label: name || "",
              },
            }}
          >
            <Button
              className="w-full"
              type="main"
              variant="primary"
              size="large"
            >
              <Typography
                tag="span"
                className="text-caption font-semibold lg:text-body lg:font-medium"
              >
                {intl("home/tutors/card/book-now")}
              </Typography>
            </Button>
          </Link>

          <Link
            href={profileUrl}
            className="w-full block"
            track={{
              event: "view_item",
              params: {
                src: "turor-card",
                tutorId: id,
                label: name || "",
              },
            }}
          >
            <Button
              type="main"
              variant="secondary"
              size="large"
              className="w-full"
            >
              <Typography
                tag="span"
                className="text-brand-700 text-caption font-semibold lg:text-body lg:font-medium"
              >
                {intl("home/tutors/card/view-profile")}
              </Typography>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TutorCard;
