import React, { useMemo } from "react";
import dayjs from "@/lib/dayjs";
import { Element, ICall, ILesson, IUser } from "@litespace/types";
import {
  ActionsMenu,
  MenuAction,
} from "@litespace/luna/components/ActionsMenu";
import { Avatar } from "@litespace/luna/components/Avatar";
import {
  Button,
  ButtonSize,
  ButtonType,
} from "@litespace/luna/components/Button";
import * as Calls from "@litespace/luna/components/Calls";
import { Card } from "@litespace/luna/components/Card";
import { IconField } from "@litespace/luna/components/IconField";
import { useFormatMessage } from "@litespace/luna/hooks/intl";
import { useMediaQueries } from "@litespace/luna/hooks/media";
import { asFullAssetUrl } from "@litespace/luna/lib";
import WatchCall from "@/components/Call/WatchCall";
import { useRender } from "@/hooks/render";
import { map } from "lodash";
import cn from "classnames";
import { Calendar, MessageCircle, X } from "react-feather";
import { Link } from "react-router-dom";
import { Route } from "@/types/routes";
import { useCancelLesson } from "@litespace/headless/lessons";

const Lesson: React.FC<
  Element<ILesson.FindUserLessonsApiResponse["list"]> & { user: IUser.Self }
> = ({ lesson, call, members, user }) => {
  const intl = useFormatMessage();
  const watch = useRender();
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
    return map(members, "userId").includes(canceller.userId);
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
    const end = dayjs(call.start).add(call.duration, "minutes");
    const now = dayjs();
    return !lesson.canceledBy && end.isAfter(now);
  }, [call.duration, call.start, lesson.canceledBy]);

  const inprogress = useMemo(() => {
    const start = dayjs(call.start);
    const end = start.add(call.duration, "minutes");
    const now = dayjs();
    return !lesson.canceledBy && now.isBetween(start, end, "seconds", "[]");
  }, [call.duration, call.start, lesson.canceledBy]);

  const title = useMemo(() => {
    return intl("page.lessons.watch.dialog.title", {
      name: otherMember?.name || "",
    });
  }, [intl, otherMember?.name]);

  const cancelLesson = useCancelLesson();

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

    if (call.recordingStatus === ICall.RecordingStatus.Processed) {
      list.push(
        {
          id: 2,
          label: intl("global.labels.watch.lesson"),
          onClick: watch.show,
        },
        {
          id: 3,
          label: intl("global.labels.download.lesson"),
          onClick: () => {
            alert("download");
          },
        }
      );
    }

    list.push({
      id: 4,
      label: intl("global.labels.block.or.ban"),
      danger: true,
      onClick() {
        alert("show block or ban dialog");
      },
    });

    return list;
  }, [call.recordingStatus, intl, watch.show]);

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
              {dayjs(call.start).format("dddd D MMMM YYYY")} (
              {dayjs(call.start).fromNow()})
            </p>
          </div>
        </div>

        <ActionsMenu actions={actions} />
      </div>

      <ul className="flex flex-col gap-3 text-foreground-light">
        <IconField Icon={Calendar}>
          {intl("page.lessons.lesson.start.with.duration", {
            start: dayjs(call.start).format("h:mm a"),
            duration: call.duration,
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
        <Calls.Status status={call.recordingStatus} />
      </ul>

      <div className="flex flex-row gap-2 mt-4">
        {upcoming ? (
          <Link to={Route.Call.replace(":id", call.id.toString())}>
            <Button size={sm ? ButtonSize.Small : ButtonSize.Tiny}>
              {inprogress
                ? intl("page.lessons.lesson.join.inprogress", {
                    duration: dayjs().to(call.start, true),
                  })
                : intl("page.lessons.lesson.join", {
                    duration: dayjs().to(call.start, true),
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

      <WatchCall
        open={watch.open}
        close={watch.hide}
        callId={call.id}
        title={title}
      />
    </Card>
  );
};

export default Lesson;
