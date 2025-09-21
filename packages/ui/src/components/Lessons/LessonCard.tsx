import { AvatarV2 } from "@/components/Avatar";
import { Button } from "@/components/Button";
import { Typography } from "@/components/Typography";
import { useFormatMessage } from "@/hooks";
import dayjs from "@/lib/dayjs";
import { Void } from "@litespace/types";
import cn from "classnames";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import More from "@litespace/assets/More";
import { Menu, type MenuAction } from "@/components/Menu";
import CalendarEdit from "@litespace/assets/CalendarEdit";
import CalendarRemove from "@litespace/assets/CalendarRemove";
import CheckCircle from "@litespace/assets/CheckCircle";
import AllMessages from "@litespace/assets/AllMessages";

export type Props = {
  start: string;
  duration: number;
  canceled: "tutor" | "student" | null;
  member: {
    id: number;
    name: string | null;
    image: string | null;
    /**
     * @note role shall be `student` when the current user is tutor and vice versa
     */
    role: "tutor" | "student";
  };
  sendingMessage: boolean;
  disabled: boolean;
  onRebook: Void;
  onJoin: Void;
  onEdit: Void;
  onCancel: Void;
  onSendMsg: Void;
};

type LessonStatus =
  | "canceled-by-you"
  | "canceled-by-student"
  | "canceled-by-tutor"
  | "not-started"
  | "just-started"
  | "started"
  | "about-to-end"
  | "ended";

export const LessonCard: React.FC<Props> = ({
  start,
  duration,
  member,
  canceled,
  sendingMessage,
  disabled,
  onJoin,
  onCancel,
  onRebook,
  onEdit,
  onSendMsg,
}) => {
  const intl = useFormatMessage();
  const end = useMemo(
    () => dayjs(start).add(duration, "minutes"),
    [duration, start]
  );

  const lessonStatusRef = useRef<LessonStatus | null>(null);

  // for code readability
  const currentUserRole = useMemo(() => {
    return member.role === "student" ? "tutor" : "student";
  }, [member]);

  const getTitle = useCallback(() => {
    const now = dayjs();

    // canceled by the cur user
    if (canceled === currentUserRole) {
      lessonStatusRef.current = "canceled-by-you";
      return intl("lesson.canceled-by-you");
    }

    // canceled by the tutor and the cur user is the student
    if (canceled === "tutor") {
      lessonStatusRef.current = "canceled-by-tutor";
      return intl("lesson.canceled-by-tutor");
    }

    // canceled by the student and the cur user is the tutor
    if (canceled === "student") {
      lessonStatusRef.current = "canceled-by-student";
      return intl("lesson.canceled-by-student");
    }

    // before start of lesson
    if (!canceled && now.isBefore(start, "second")) {
      lessonStatusRef.current = "not-started";
      return intl("lesson.time-to-join", {
        value: dayjs(start).fromNow(true),
        finish: null,
      });
    }
    // at first 3 minutes of lessons
    if (
      !canceled &&
      now.isBetween(start, dayjs(start).add(3, "minutes"), "seconds", "[]")
    ) {
      lessonStatusRef.current = "just-started";
      return intl("lesson.can-join-now");
    }

    // at the first half of the lesson
    if (
      !canceled &&
      now.isBetween(
        dayjs(start).add(3, "minutes"),
        dayjs(start).add(duration / 2, "minutes"),
        "seconds",
        "(]"
      )
    ) {
      lessonStatusRef.current = "started";
      return intl("lesson.time-from-start", {
        value: dayjs().diff(start, "minute"),
      });
    }

    // at the second half of the lesson
    if (
      !canceled &&
      now.isBetween(
        dayjs(start).add(duration / 2, "minutes"),
        end,
        "seconds",
        "[]"
      )
    ) {
      lessonStatusRef.current = "about-to-end";
      return intl("lesson.time-to-end-lesson", {
        value: dayjs(end).fromNow(true),
      });
    }

    // after finish of the lesson
    if (!canceled && now.isAfter(end)) {
      lessonStatusRef.current = "ended";
      return intl("lesson.ended");
    }
  }, [canceled, currentUserRole, intl, start, duration, end]);

  const [title, setTitle] = useState<string | undefined>(getTitle());

  useEffect(() => {
    const interval = setInterval(() => {
      const title = getTitle();
      if (title) setTitle(title);
    }, 60_000);
    return () => clearInterval(interval);
  }, [getTitle]);

  const actions: MenuAction[] = useMemo(
    () =>
      currentUserRole === "student"
        ? [
            // Student related actions
            {
              label: intl("lesson-card.menu.edit"),
              icon: <CalendarEdit />,
              onClick: () => onEdit(),
            },
            {
              label: intl("lesson-card.menu.cancel"),
              icon: <CalendarRemove />,
              onClick: () => onCancel(),
            },
          ]
        : [
            // Tutor related actions
            {
              label: intl("lesson-card.menu.cancel"),
              icon: <CalendarRemove />,
              onClick: () => onCancel(),
            },
          ],
    [intl, onCancel, onEdit, currentUserRole]
  );

  const action = useMemo(() => {
    const ended = end.isBefore(dayjs());
    if (currentUserRole === "student" && (ended || canceled))
      return {
        label: intl("lesson-card.button.rebook"),
        onClick: onRebook,
      };
    if (currentUserRole === "tutor" && (ended || canceled))
      return {
        label: intl("lesson-card.button.send-message"),
        onClick: onSendMsg,
      };
    return {
      label: intl("lesson-card.button.join"),
      onClick: onJoin,
    };
  }, [canceled, currentUserRole, end, intl, onJoin, onRebook, onSendMsg]);

  const buttonType = useMemo(() => {
    if (
      lessonStatusRef.current === "just-started" ||
      lessonStatusRef.current === "started" ||
      lessonStatusRef.current === "about-to-end"
    )
      return "main";
    return "natural";
  }, []);

  const button = (
    <Button
      size="large"
      className={cn("w-full mt-auto [&>*]:text")}
      disabled={disabled}
      onClick={action.onClick}
      loading={
        sendingMessage &&
        action.label === intl("lesson-card.button.send-message")
      }
      type={buttonType}
    >
      {action.label}
    </Button>
  );

  const canRenderMsgButton = useMemo(() => {
    if (
      currentUserRole === "tutor" &&
      lessonStatusRef.current === "not-started"
    )
      return true;

    if (
      (currentUserRole === "student" && canceled) ||
      (currentUserRole === "student" &&
        lessonStatusRef.current === "not-started") ||
      (currentUserRole === "student" && lessonStatusRef.current === "ended")
    )
      return true;

    return false;
  }, [canceled, currentUserRole]);

  return (
    <div
      className={cn(
        "flex flex-col items-stretch gap-4 p-4 md:p-6 bg-natural-50",
        "border rounded-2xl border-natural-100"
      )}
    >
      <div className="flex justify-between items-stretch gap-6">
        {!canceled && dayjs().isAfter(end) ? (
          <div className="flex gap-2 items-center">
            <CheckCircle className="[&>*]:stroke-brand-700 w-6 h-6" />
            <Typography
              tag="span"
              className={cn(
                "text-brand-700 line-clamp-1 truncate text-caption font-semibold"
              )}
            >
              {intl("lesson.ended")}
            </Typography>
          </div>
        ) : (
          <>
            <Typography
              tag="h1"
              className={cn(
                "line-clamp-1 text-caption font-semibold",
                !canceled ? "text-brand-700" : "text-destructive-600"
              )}
            >
              {title}
            </Typography>
            {!canceled ? (
              <Menu actions={actions}>
                <More className="[&>*]:fill-natural-800 w-4 h-1" />
              </Menu>
            ) : null}
          </>
        )}
      </div>
      <div className="flex flex-col gap-6">
        <div className="flex gap-2">
          <div className="w-[65px] h-[65px] rounded-full overflow-hidden">
            <AvatarV2 src={member.image} alt={member.name} id={member.id} />
          </div>
          <div className="flex flex-col gap-1">
            <Typography
              tag="span"
              className="text-caption font-bold leading-[21px] text-natural-950"
            >
              {member.name}
            </Typography>
            <Typography
              tag="span"
              className="text-natural-700 text-tiny font-normal"
            >
              {dayjs(start).format("dddd، D MMMM")}
            </Typography>
            <Typography
              tag="span"
              className="text-natural-700 flex items-center text-tiny font-normal"
            >
              {dayjs(start).format("h:mm a")}
              {" - "}
              {dayjs(start).add(duration, "minutes").format("h:mm a")}
            </Typography>
          </div>
        </div>
        <div className="flex gap-4">
          {button}
          {canRenderMsgButton ? (
            <Button
              size="large"
              variant="secondary"
              type={buttonType}
              startIcon={<AllMessages className="icon" />}
              onClick={onSendMsg}
              loading={sendingMessage}
              disabled={sendingMessage}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default LessonCard;
