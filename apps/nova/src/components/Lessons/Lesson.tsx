import React, { useCallback, useMemo } from "react";
import dayjs from "@/lib/dayjs";
import { Element, ILesson, IUser } from "@litespace/types";
import { ActionsMenu, MenuAction } from "@litespace/luna/ActionsMenu";
import { Avatar } from "@litespace/luna/Avatar";
import { Button, ButtonSize, ButtonType } from "@litespace/luna/Button";
import { Card } from "@litespace/luna/Card";
import { IconField } from "@litespace/luna/IconField";
import { useFormatMessage } from "@litespace/luna/hooks/intl";
import { useMediaQueries } from "@litespace/luna/hooks/media";
import { asFullAssetUrl } from "@litespace/luna/backend";
import cn from "classnames";
import { Calendar, MessageCircle, X } from "react-feather";
import { Link } from "react-router-dom";
import { Route } from "@/types/routes";
import { useCancelLesson } from "@litespace/headless/lessons";

const Lesson: React.FC<
  Element<ILesson.FindUserLessonsApiResponse["list"]> & { user: IUser.Self }
> = ({ lesson, members, user }) => {
  const intl = useFormatMessage();
  const otherMember = useMemo(() => {
    return members.find((member) => member.userId !== user.id);
  }, [members, user.id]);

  const canceller = useMemo(() => {
    return members.find((member) => member.userId === lesson.canceledBy);
  }, [lesson.canceledBy, members]);

  const isUserCanceled = useMemo(() => {
    return canceller?.userId === user.id;
  }, [canceller?.userId, user.id]);

  const isMemberCanceled = useMemo(() => {
    if (!canceller?.userId) return;
    return members.map((member) => member.userId).includes(canceller.userId);
  }, [canceller?.userId, members]);

  const canceledAt = useMemo(() => {
    if (!lesson.canceledAt) return "";
    return dayjs(lesson.canceledAt).format("dddd D MMMM YYYY");
  }, [lesson.canceledAt]);

  const canceledSince = useMemo(() => {
    if (!lesson.canceledAt) return "";
    return dayjs(lesson.canceledAt).fromNow();
  }, [lesson.canceledAt]);

  const upcoming = useMemo(() => {
    const end = dayjs(lesson.start).add(lesson.duration, "minutes");
    const now = dayjs();
    return !lesson.canceledBy && end.isAfter(now);
  }, [lesson.canceledBy, lesson.duration, lesson.start]);

  const inprogress = useMemo(() => {
    const start = dayjs(lesson.start);
    const end = start.add(lesson.duration, "minutes");
    const now = dayjs();
    return !lesson.canceledBy && now.isBetween(start, end, "seconds", "[]");
  }, [lesson.canceledBy, lesson.duration, lesson.start]);

  const onSuccess = useCallback(() => {}, []);
  const onError = useCallback(() => {}, []);

  const cancelLesson = useCancelLesson({ onSuccess, onError });

  const actions = useMemo((): MenuAction[] => {
    const list: MenuAction[] = [
      {
        id: 1,
        label: intl("page.lessons.lesson.reschedule"),
        onClick() {
          alert("show schedule lesson dialog");
        },
      },
    ];

    list.push({
      id: 4,
      label: intl("global.labels.block.or.ban"),
      danger: true,
      onClick() {
        alert("show block or ban dialog");
      },
    });

    return list;
  }, [intl]);

  const { sm } = useMediaQueries();

  return (
    <Card className={cn("w-full lg:w-2/3")}>
      <div className="flex flex-row items-center justify-between">
        <div className="flex flex-row items-center justify-start gap-2 mb-2">
          <div className="w-12 h-12 overflow-hidden rounded-full">
            <Avatar
              src={
                otherMember?.image
                  ? asFullAssetUrl(otherMember.image)
                  : "/avatar-1.png"
              }
            />
          </div>
          <div>
            <p>{otherMember?.name}</p>
            <p className="text-sm text-foreground-lighter">
              {dayjs(lesson.start).format("dddd D MMMM YYYY")} (
              {dayjs(lesson.start).fromNow()})
            </p>
          </div>
        </div>

        <ActionsMenu actions={actions} />
      </div>

      <ul className="flex flex-col gap-3 text-foreground-light">
        <IconField Icon={Calendar}>
          {intl("page.lessons.lesson.start.with.duration", {
            start: dayjs(lesson.start).format("h:mm a"),
            duration: lesson.duration,
          })}
        </IconField>

        {lesson.canceledBy ? (
          <IconField Icon={X}>
            {isUserCanceled
              ? intl("page.lessons.lesson.canceled.by.you", {
                  date: canceledAt,
                  since: canceledSince,
                })
              : isMemberCanceled
              ? intl("page.lessons.lesson.canceled.by.other", {
                  name: canceller?.name || "",
                  date: canceledAt,
                  since: canceledSince,
                })
              : intl("page.lessons.lesson.canceled")}
          </IconField>
        ) : null}
      </ul>

      <div className="flex flex-row gap-2 mt-4">
        {upcoming ? (
          <Link to={Route.Call.replace(":id", lesson.callId.toString())}>
            <Button size={sm ? ButtonSize.Small : ButtonSize.Tiny}>
              {inprogress
                ? intl("page.lessons.lesson.join.inprogress", {
                    duration: dayjs().to(lesson.start, true),
                  })
                : intl("page.lessons.lesson.join", {
                    duration: dayjs().to(lesson.start, true),
                  })}
            </Button>
          </Link>
        ) : null}

        <Link to={Route.Chat}>
          <Button
            className={cn({
              "!w-[26px]": !sm,
            })}
            size={sm ? ButtonSize.Small : ButtonSize.Tiny}
          >
            <MessageCircle className="w-[20px] h-[20px] md:w-auto md:h-auto" />
          </Button>
        </Link>

        <Button
          loading={cancelLesson.isPending}
          disabled={cancelLesson.isPending || !!lesson.canceledBy}
          onClick={() => cancelLesson.mutate(lesson.id)}
          type={ButtonType.Error}
          size={ButtonSize.Small}
        >
          {intl("global.labels.cancel")}
        </Button>
      </div>
    </Card>
  );
};

export default Lesson;
