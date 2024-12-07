import { Typography } from "@/components/Typography";
import dayjs from "@/lib/dayjs";
import { first, maxBy, minBy } from "lodash";
import React, { useMemo, useState } from "react";
import cn from "classnames";
import { AnimatePresence, motion } from "framer-motion";
import { Avatar } from "@/components/Avatar";
import { orUndefined } from "@litespace/sol/utils";
import Clock from "@litespace/assets/Clock";
import { Menu, MenuAction } from "@/components/Menu";
import CalendarEdit from "@litespace/assets/CalendarEdit";
import CalendarRemove from "@litespace/assets/CalendarRemove";
import More from "@litespace/assets/More";
import Video from "@litespace/assets/Video16X16";
import { useFormatMessage } from "@/hooks";

type LessonActions = {
  onCancel(id: number): void;
  onEdit(id: number): void;
  onRebook(id: number): void;
  onJoin(id: number): void;
};

const OptionsMenu: React.FC<
  LessonActions & {
    canceled: boolean;
    id: number;
    open?: boolean;
    setOpen?: (open: boolean) => void;
  }
> = ({ id, canceled, onCancel, onEdit, onRebook, onJoin, open, setOpen }) => {
  const intl = useFormatMessage();

  const actions: MenuAction[] = useMemo(() => {
    if (canceled)
      return [
        {
          icon: <CalendarEdit />,
          label: intl("schedule.lesson.rebook"),
          onClick: () => onRebook(id),
        },
      ];
    return [
      {
        icon: <Video width={16} height={16} />,
        label: intl("schedule.lesson.join"),
        onClick: () => onJoin(id),
      },
      {
        icon: <CalendarEdit />,
        label: intl("schedule.lesson.edit"),
        onClick: () => onEdit(id),
      },
      {
        icon: <CalendarRemove />,
        label: intl("schedule.lesson.cancel"),
        onClick: () => onCancel(id),
      },
    ];
  }, [canceled, intl, onRebook, id, onJoin, onEdit, onCancel]);

  return (
    <Menu
      actions={actions}
      open={open}
      setOpen={setOpen}
      title={canceled ? intl("schedule.lesson.canceled-by-tutor") : undefined}
      danger={canceled}
    >
      <div className="tw-p-2">
        <More />
      </div>
    </Menu>
  );
};

const LessonSpan: React.FC<{ start: string | null; end: string | null }> = ({
  start,
  end,
}) => {
  return (
    <Typography
      element="tiny-text"
      weight="semibold"
      className="tw-text-brand-700"
    >
      {start ? dayjs(start).format("h:mm a") : "??"}&nbsp;-&nbsp;
      {end ? dayjs(end).format("h:mm a") : "??"}
    </Typography>
  );
};

const MemberAvatar: React.FC<{
  src: string | null;
  alt: string | null;
  seed: string;
}> = ({ src, alt, seed }) => {
  return (
    <div className="tw-shrink-0 tw-w-9 tw-h-9 tw-rounded-full tw-overflow-hidden">
      <Avatar src={orUndefined(src)} alt={orUndefined(alt)} seed={seed} />
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
        "tw-relative tw-border tw-px-[10px] tw-py-2 tw-rounded-lg",
        canceled
          ? "tw-bg-[rgba(153,0,0,0.04)] tw-border-destructive-600 "
          : "tw-bg-[rgba(29,124,78,0.04)] tw-border-brand-700 "
      )}
    >
      {children}
    </div>
  );
};

type Lesson = {
  id: number;
  /**
   * When rendered to a student we show the tutor image and name.
   * When renderd to a tutor we do the opposit.
   */
  otherMember: {
    id: number;
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

interface Props extends LessonActions {
  lessons: Array<Lesson>;
}

const SingleLesson: React.FC<Lesson & LessonActions> = ({
  otherMember,
  start,
  end,
  canceled,
  ...actions
}) => {
  return (
    <Card canceled={canceled}>
      <div className="tw-absolute tw-top-0 tw-left-0">
        <OptionsMenu canceled={canceled} {...actions} />
      </div>
      <div className="tw-px-[10px]">
        <div className="tw-flex tw-flex-row tw-gap-2 tw-items-center">
          <div className="tw-border tw-border-natural-50 tw-rounded-full">
            <MemberAvatar
              src={otherMember.image}
              alt={otherMember.name}
              seed={otherMember.id.toString()}
            />
          </div>
          <Typography
            element="tiny-text"
            weight="semibold"
            className={cn(
              "tw-w-full tw-truncate",
              canceled ? "tw-text-destructive-600" : "tw-text-natural-700"
            )}
          >
            {otherMember.name || "-"}
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

const LessonGroupItem: React.FC<
  Lesson & LessonActions & { open: boolean; setOpen(open: boolean): void }
> = ({ otherMember, canceled, start, end, ...actions }) => {
  return (
    <div className="tw-relative tw-px-1 tw-bg-natural-50 tw-shadow-lesson-event-card tw-rounded-lg">
      <div className="tw-absolute -tw-top-2 tw-left-0">
        <OptionsMenu canceled={canceled} {...actions} />
      </div>
      <div className="tw-px-1 tw-py-1 tw-mb-1 tw-flex tw-flex-row tw-gap-2 tw-items-center tw-justify-start">
        <div className="tw-w-6 tw-h-6 tw-overflow-hidden tw-rounded-full tw-border tw-border-natural-400 tw-shrink-0">
          <Avatar
            src={orUndefined(otherMember.image)}
            alt={orUndefined(otherMember.name)}
            seed={otherMember.id.toString()}
          />
        </div>

        <Typography
          element="tiny-text"
          weight="semibold"
          className="tw-text-natural-700 tw-w-3/5 tw-truncate"
        >
          {otherMember.name || "-"}
        </Typography>
      </div>

      <div className="tw-flex tw-flex-row tw-items-center tw-gap-2 tw-px-1 tw-py-1">
        <Clock />
        <LessonSpan start={start} end={end} />
      </div>
    </div>
  );
};

const MultipleLessons: React.FC<LessonActions & { lessons: Lesson[] }> = ({
  lessons,
  ...actions
}) => {
  const [show, setShow] = useState<number | null>(null);
  const [menuOpened, setMenuOpened] = useState<boolean>(false);

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
        <LessonSpan start={start} end={end} />
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
                zIndex: idx === 0 ? 1 : 0,
              }}
              whileHover={{
                zIndex: 4,
              }}
              onHoverStart={() => {
                setShow(lesson.id);
              }}
              onHoverEnd={() => {
                if (menuOpened) return;
                setShow(null);
              }}
            >
              <div>
                <motion.button
                  whileHover={{
                    scale: 1.05,
                  }}
                  type="button"
                  className={cn(
                    "tw-rounded-full",
                    lesson.canceled && "tw-border tw-border-destructive-500"
                  )}
                >
                  <MemberAvatar
                    src={lesson.otherMember.image}
                    alt={lesson.otherMember.name}
                    seed={lesson.otherMember.id.toString()}
                  />
                </motion.button>
                <AnimatePresence>
                  {show === lesson.id ? (
                    <div className="tw-absolute tw-bottom-0 tw-translate-y-full tw-w-36 tw-pt-1 tw-z-10">
                      <LessonGroupItem
                        {...lesson}
                        {...actions}
                        open={menuOpened}
                        setOpen={(open) => {
                          if (!open) setShow(null);
                          setMenuOpened(open);
                        }}
                      />
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

export const Lessons: React.FC<Props> = ({ lessons, ...actions }) => {
  const lesson = useMemo(() => {
    const lesson = first(lessons);
    if (!lesson || lessons.length > 1) return;
    return lesson;
  }, [lessons]);

  if (lesson) return <SingleLesson {...lesson} {...actions} />;

  return (
    <Card>
      <MultipleLessons lessons={lessons} {...actions} />
    </Card>
  );
};
