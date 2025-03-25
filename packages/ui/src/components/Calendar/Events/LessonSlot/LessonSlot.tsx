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
} from "@/components/Calendar/Events/shared";
import { LessonActions, LessonProps } from "@/components/Calendar/types";

import { Menu, MenuAction } from "@/components/Menu";
import CalendarEdit from "@litespace/assets/CalendarEdit";
import CalendarRemove from "@litespace/assets/CalendarRemove";
import More from "@litespace/assets/More";
import Video from "@litespace/assets/Video16X16";
import { useFormatMessage } from "@/hooks";
import { Avatar } from "@/components/Avatar";
import { orUndefined } from "@litespace/utils/utils";
import Clock from "@litespace/assets/Clock16X16";

type Props = Partial<LessonActions> & {
  lessons: Array<LessonProps>;
};

export const LessonSlot: React.FC<Props> = ({ lessons, ...actions }) => {
  const lesson = useMemo(() => {
    if (lessons.length > 1) return;
    return first(lessons);
  }, [lessons]);

  if (isEmpty(lessons)) return null;
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
      <div className="absolute top-0 left-0">
        <OptionsMenu canceled={canceled} {...actions} />
      </div>
      <div className="px-[10px]">
        <div className="flex flex-row gap-2 items-center">
          <div className="border border-natural-50 rounded-full">
            <MemberAvatar
              src={otherMember.image}
              alt={otherMember.name}
              seed={otherMember.id.toString()}
            />
          </div>
          <Typography
            tag="span"
            className={cn(
              "w-full truncate font-semibold text-tiny",
              canceled ? "text-destructive-600" : "text-natural-700"
            )}
          >
            {otherMember.name || "-"}
          </Typography>
        </div>

        <div className="flex items-center justify-center mt-2">
          <Typography
            tag="span"
            className={cn(
              "font-semibold text-tiny",
              canceled ? "text-destructive-600" : "text-brand-700"
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
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-start">
        <EventSpan start={start} end={end} />
      </div>

      <div className="flex relative h-9">
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
                    "rounded-full",
                    lesson.canceled && "border border-destructive-500"
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
                    <div className="absolute bottom-0 translate-y-full w-36 pt-1 z-10">
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
        icon: <CalendarRemove height={16} width={16} />,
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
      <div className="p-2">
        <More className="[&>*]:fill-natural-800" />
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
    <div className="relative px-1 bg-natural-50 shadow-lesson-event-card rounded-lg">
      <div className="absolute top-0 left-0">{OptionsMenu}</div>
      <div className="px-1 py-1 mb-1 flex flex-row gap-2 items-center justify-start">
        <div className="w-6 h-6 overflow-hidden rounded-full border border-natural-400 shrink-0">
          <Avatar
            src={orUndefined(otherMember.image)}
            alt={orUndefined(otherMember.name)}
            seed={otherMember.id.toString()}
          />
        </div>

        <Typography
          tag="span"
          className="text-natural-700 w-3/5 truncate font-semibold text-tiny"
        >
          {otherMember.name || "-"}
        </Typography>
      </div>

      <div className="flex flex-row items-center gap-2 px-1 py-1">
        <Clock className="[&>*]:stroke-brand-700 w-4 h-4" />
        <EventSpan start={start} end={end} />
      </div>
    </div>
  );
};
