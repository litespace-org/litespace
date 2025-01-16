import React, { useMemo, useState } from "react";
import cn from "classnames";
import dayjs from "@/lib/dayjs";
import { first, isEmpty, maxBy, minBy } from "lodash";
import { AnimatePresence, motion } from "framer-motion";

import { Typography } from "@/components/Typography";
import {
  EventSpan,
  MemberAvatar,
  Card,
} from "@/components/Calendar/v2/Events/shared";
import { LessonActions, LessonProps } from "@/components/Calendar/v2/types";

import { Menu, MenuAction } from "@/components/Menu";
import CalendarEdit from "@litespace/assets/CalendarEdit";
import CalendarRemove from "@litespace/assets/CalendarRemove";
import More from "@litespace/assets/More";
import Video from "@litespace/assets/Video16X16";
import { useFormatMessage } from "@/hooks";
import { Avatar } from "@/components/Avatar";
import { orUndefined } from "@litespace/sol/utils";
import Clock from "@litespace/assets/Clock16X16";

type Props = Partial<LessonActions> & {
  lessons: Array<LessonProps>;
};

export const LessonSlot: React.FC<Props> = ({ lessons, ...actions }) => {
  if (isEmpty(lessons)) return null;

  const lesson = useMemo(() => {
    if (lessons.length > 1) return;
    return first(lessons);
  }, [lessons]);

  if (lesson) return <SingleLesson {...lesson} {...actions} />;

  return (
    <Card>
      <MultipleLessons lessons={lessons} {...actions} />
    </Card>
  );
};

const SingleLesson: React.FC<LessonProps & Partial<LessonActions>> = ({
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

const MultipleLessons: React.FC<
  Partial<LessonActions> & { lessons: LessonProps[] }
> = ({ lessons, ...actions }) => {
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
        <EventSpan start={start} end={end} />
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
                      <EventGroupItem
                        {...lesson}
                        {...actions}
                        OptionsMenu={
                          <OptionsMenu
                            id={lesson.id}
                            canceled={false}
                            open={menuOpened}
                            setOpen={setMenuOpened}
                            {...actions}
                          />
                        }
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

const OptionsMenu: React.FC<
  Partial<LessonActions> & {
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
          onClick: () => {
            if (!onRebook) console.warn("onRebook is undefined.");
            if (onRebook) onRebook(id);
          },
        },
      ];
    return [
      {
        icon: <Video width={16} height={16} />,
        label: intl("schedule.lesson.join"),
        onClick: () => {
          if (!onJoin) console.warn("onJoin is undefined.");
          if (onJoin) onJoin(id);
        },
      },
      {
        icon: <CalendarEdit />,
        label: intl("schedule.lesson.edit"),
        onClick: () => {
          if (!onEdit) console.warn("onEdit is undefined.");
          if (onEdit) onEdit(id);
        },
      },
      {
        icon: <CalendarRemove />,
        label: intl("schedule.lesson.cancel"),
        onClick: () => {
          if (!onCancel) console.warn("onCancel is undefined.");
          if (onCancel) onCancel(id);
        },
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
        <More className="[&>*]:tw-fill-natural-800" />
      </div>
    </Menu>
  );
};

const EventGroupItem: React.FC<
  LessonProps &
    Partial<LessonActions> & {
      otherMember: {
        id: number;
        image: string | null;
        name: string | null;
      };
      OptionsMenu: React.ReactNode;
    }
> = ({ otherMember, start, end, OptionsMenu }) => {
  return (
    <div className="tw-relative tw-px-1 tw-bg-natural-50 tw-shadow-lesson-event-card tw-rounded-lg">
      <div className="tw-absolute tw-top-0 tw-left-0">{OptionsMenu}</div>
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
        <Clock className="[&>*]:tw-stroke-brand-700" />
        <EventSpan start={start} end={end} />
      </div>
    </div>
  );
};
