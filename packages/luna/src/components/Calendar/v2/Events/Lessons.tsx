import { Typography } from "@/components/Typography";
import dayjs from "@/lib/dayjs";
import { first, maxBy, minBy } from "lodash";
import React, { useMemo, useState } from "react";
import cn from "classnames";
import { AnimatePresence, motion } from "framer-motion";
import { Avatar } from "@/components/Avatar";
import { orUndefined } from "@litespace/sol/utils";
import Clock from "@litespace/assets/Clock";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import CalendarEdit from "@litespace/assets/CalendarEdit";
import CalendarRemove from "@litespace/assets/CalendarRemove";
import More from "@litespace/assets/More";
import { useFormatMessage } from "@/hooks";

type LessonActions = {
  onCancel(id: number): void;
  onEdit(id: number): void;
  onRebook(id: number): void;
};

const Menu: React.FC<
  LessonActions & {
    canceled: boolean;
    id: number;
    open?: boolean;
    setOpen?: (open: boolean) => void;
  }
> = ({ id, canceled, onCancel, onEdit, onRebook, open, setOpen }) => {
  const intl = useFormatMessage();

  const items = useMemo(() => {
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
  }, [canceled, intl, onRebook, id, onEdit, onCancel]);

  return (
    <DropdownMenu.Root open={open} onOpenChange={setOpen}>
      <DropdownMenu.Trigger
        className="tw-p-2 focus:tw-outline-none"
        type="button"
      >
        <More />
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          side="top"
          className={cn(
            "tw-shadow-lesson-event-card tw-bg-natural-50 tw-p-1",
            "tw-flex tw-flex-col tw-gap-1 tw-rounded-lg tw-z-[5]"
          )}
        >
          {canceled ? (
            <Typography
              element="tiny-text"
              weight="semibold"
              className="tw-text-destructive-600 tw-max-w-24"
            >
              {intl("schedule.lesson.canceled-by-tutor")}
            </Typography>
          ) : null}

          {items.map(({ icon, label, onClick }) => (
            <DropdownMenu.Item
              key={label}
              className={cn(
                "tw-flex tw-flex-row tw-gap-2 tw-p-1 tw-pe-4 tw-rounded-lg",
                "hover:tw-bg-natural-100 active:tw-bg-brand-700",
                "[&>span]:active:!tw-text-natural-50 [&>svg>*]:active:tw-stroke-natural-50",
                "focus:tw-outline-none focus:tw-bg-natural-100"
              )}
              onClick={onClick}
            >
              {icon}
              <Typography
                element="tiny-text"
                weight="semibold"
                className="tw-text-natural-600"
              >
                {label}
              </Typography>
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
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
        "tw-relative tw-border tw-border-natural-100 tw-px-[10px] tw-py-2 tw-rounded-lg",
        canceled ? "tw-bg-destructive-100" : "tw-bg-brand-100"
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
      <div className="tw-absolute -tw-top-2 tw-left-0">
        <Menu canceled={canceled} {...actions} />
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
            className="tw-text-natural-700 tw-w-full tw-truncate"
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
        <Menu canceled={canceled} {...actions} />
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
                zIndex: 4 - idx,
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
                    <div className="tw-absolute tw-bottom-0 tw-translate-y-full tw-w-36 tw-pt-1">
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
