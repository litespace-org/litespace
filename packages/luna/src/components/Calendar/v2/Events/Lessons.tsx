import { Typography } from "@/components/Typography";
import dayjs from "@/lib/dayjs";
import { first, maxBy, minBy } from "lodash";
import React, { useMemo, useState } from "react";
import cn from "classnames";
import { AnimatePresence, motion } from "framer-motion";

// todo: we should impl. a generic avatar
const MemberAvatar: React.FC<{ avatar: string | null }> = ({ avatar }) => {
  if (!avatar) return "TODO: NO AVATAR";
  return (
    <div className="tw-shrink-0">
      <img
        className="tw-w-9 tw-h-9 tw-rounded-full tw-overflow-hidden tw-object-contain"
        src={avatar}
      />
    </div>
  );
};

const Card: React.FC<{ children: React.ReactNode; canceled?: boolean }> = ({
  children,
  canceled,
}) => {
  return (
    <div
      className={cn(
        "tw-border tw-border-natural-100  tw-px-[10px] tw-py-2 tw-rounded-lg",
        canceled ? "tw-bg-destructive-100" : "tw-bg-brand-100"
      )}
    >
      {children}
    </div>
  );
};

type Lesson = {
  /**
   * When rendered to a student we show the tutor image and name.
   * When renderd to a tutor we do the opposit.
   */
  otherMember: {
    image: string | null;
    name: string | null;
  };
  /**
   * ISO string date time
   */
  start: string;
  /**
   * ISO string date time
   */
  end: string;
  canceled: boolean;
};

interface Props {
  lessons: Array<Lesson>;
}

const SingleLesson: React.FC<Lesson> = ({
  otherMember,
  start,
  end,
  canceled,
}) => {
  return (
    <Card canceled={canceled}>
      <div className="tw-px-[10px]">
        <div className="tw-flex tw-flex-row tw-gap-2 tw-items-center">
          <MemberAvatar avatar={otherMember.image} />
          <Typography
            element="tiny-text"
            weight="semibold"
            className="tw-text-natural-700 tw-w-full tw-truncate"
          >
            {otherMember.name || "TODO: ADD NAME"}
          </Typography>
        </div>

        <div className="tw-flex tw-items-center tw-justify-center tw-mt-2">
          <Typography
            element="tiny-text"
            weight="semibold"
            className={cn(
              canceled ? "tw-text-destructive-600" : "tw-text-brand-700"
            )}
          >
            {dayjs(start).format("h:mm a")}&nbsp;-&nbsp;
            {dayjs(end).format("h:mm a")}
          </Typography>
        </div>
      </div>
    </Card>
  );
};

const MultipleLessons: React.FC<{ lessons: Lesson[] }> = ({ lessons }) => {
  const [show, setShow] = useState<string | null>(null);
  const [start, end] = useMemo(() => {
    const start =
      minBy(lessons, (lesson) => dayjs(lesson.start).unix())?.start || null;
    const end =
      maxBy(lessons, (lesson) => dayjs(lesson.start).unix())?.end || null;
    return [start, end];
  }, [lessons]);

  return (
    <div className="tw-flex tw-flex-col tw-gap-2">
      <div className="tw-flex tw-items-center tw-justify-start">
        <Typography
          element="tiny-text"
          weight="semibold"
          className="tw-text-brand-700"
        >
          {start ? dayjs(start).format("h:mm a") : "??"}&nbsp;-&nbsp;
          {end ? dayjs(end).format("h:mm a") : "??"}
        </Typography>
      </div>

      <div className="tw-flex tw-relative tw-h-9">
        {lessons.map((lesson, idx) => {
          return (
            <motion.div
              key={lesson.start}
              initial={{
                // 36px: the avatar width
                // 8px: the overlapping between avatars
                x: idx >= 1 ? -idx * (36 - 8) : 0,
              }}
              style={{
                position: "absolute",
                zIndex: 4 - idx,
              }}
              whileHover={{
                zIndex: 4,
                scale: 1.05,
              }}
              onHoverStart={() => {
                setShow(lesson.start);
              }}
              onHoverEnd={() => {
                setShow(null);
              }}
            >
              <div>
                <div
                  className={cn(
                    "tw-rounded-full",
                    lesson.canceled && "tw-border tw-border-destructive-500"
                  )}
                >
                  <MemberAvatar avatar={lesson.otherMember.image} />
                </div>
                <AnimatePresence>
                  {show === lesson.start ? (
                    <div className="tw-absolute tw-bottom-0 tw-translate-y-full tw-w-36 tw-pt-1">
                      <SingleLesson {...lesson} />
                    </div>
                  ) : null}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export const Lessons: React.FC<Props> = ({ lessons }) => {
  const lesson = useMemo(() => {
    const lesson = first(lessons);
    if (!lesson || lessons.length > 1) return;
    return lesson;
  }, [lessons]);

  if (lesson) return <SingleLesson {...lesson} />;

  return (
    <Card>
      <MultipleLessons lessons={lessons} />
    </Card>
  );
};
