import React, { useMemo } from "react";
import dayjs from "@/lib/dayjs";
import { Element, ICall, ILesson, IUser } from "@litespace/types";
import { useIntl } from "react-intl";
import {
  ActionsMenu,
  Avatar,
  Card,
  MenuAction,
  messages,
} from "@litespace/luna";
import { asFullAssetUrl } from "@/lib/atlas";
import WatchLesson from "../Call/WatchCall";
import { useRender } from "@/hooks/render";
import { map } from "lodash";
import cn from "classnames";
import { Calendar, Clock, X } from "react-feather";
import { Link } from "react-router-dom";
import { Route } from "@/types/routes";
import TimelineListText from "@/components/Common/TimelineListText";
import Status from "@/components/Call/Status";

const Lesson: React.FC<
  Element<ILesson.FindUserLessonsApiResponse["list"]> & { user: IUser.Self }
> = ({ lesson, call, members, user }) => {
  const intl = useIntl();
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
    return intl.formatMessage(
      { id: messages["page.lessons.watch.dialog.title"] },
      { name: otherMember?.name.ar || "" }
    );
  }, [intl, otherMember?.name.ar]);

  const actions = useMemo((): MenuAction[] => {
    const list: MenuAction[] = [
      {
        id: 1,
        label: intl.formatMessage({
          id: messages["page.lessons.lesson.reschedule"],
        }),
        onClick() {
          alert("show schedule lesson dialog");
        },
      },
    ];

    if (call.recordingStatus === ICall.RecordingStatus.Processed) {
      list.push(
        {
          id: 2,
          label: intl.formatMessage({
            id: messages["global.labels.watch.lesson"],
          }),
          onClick: watch.show,
        },
        {
          id: 3,
          label: intl.formatMessage({
            id: messages["global.labels.download.lesson"],
          }),
          onClick: () => {
            alert("download");
          },
        }
      );
    }

    list.push({
      id: 4,
      label: intl.formatMessage({
        id: messages["global.labels.block.or.ban"],
      }),
      danger: true,
      onClick() {
        alert("show block or ban dialog");
      },
    });

    return list;
  }, [call.recordingStatus, intl, watch.show]);

  return (
    <Card className={cn("w-full lg:w-2/3")}>
      <div className="flex flex-row justify-between items-center">
        <div className="flex flex-row items-center justify-start gap-2 mb-2">
          <div className="w-12 h-12 rounded-full overflow-hidden">
            <Avatar
              src={
                otherMember?.photo
                  ? asFullAssetUrl(otherMember.photo)
                  : "/avatar-1.png"
              }
            />
          </div>
          <div>
            <p>{otherMember?.name.ar}</p>
            <p className="text-sm text-foreground-lighter">
              {dayjs(call.start).format("dddd D MMMM YYYY")} (
              {dayjs(call.start).fromNow()})
            </p>
          </div>
        </div>

        <ActionsMenu actions={actions} />
      </div>

      <ul className="text-foreground-light flex flex-col gap-3">
        <TimelineListText Icon={Calendar}>
          {intl.formatMessage(
            { id: messages["page.lessons.lesson.start.with.duration"] },
            {
              start: dayjs(call.start).format("h:mm a"),
              duration: call.duration,
            }
          )}
        </TimelineListText>
        {lesson.canceledBy ? (
          <TimelineListText Icon={X}>
            {isUserCanceled
              ? intl.formatMessage(
                  { id: messages["page.lessons.lesson.canceled.by.you"] },
                  { date: canceledAt, since: canceledSince }
                )
              : isMemberCanceled
                ? intl.formatMessage(
                    { id: messages["page.lessons.lesson.canceled.by.other"] },
                    {
                      name: canceller?.name.ar || "",
                      date: canceledAt,
                      since: canceledSince,
                    }
                  )
                : intl.formatMessage({
                    id: messages["page.lessons.lesson.canceled"],
                  })}
          </TimelineListText>
        ) : null}

        <Status status={call.recordingStatus} />
      </ul>

      {upcoming ? (
        <div className="flex flex-row items-center gap-2 mt-2 text-foreground-light">
          <div>
            <Clock />
          </div>
          <p>
            {inprogress
              ? intl.formatMessage(
                  { id: messages["page.lessons.lesson.join.inprogress"] },
                  {
                    duration: dayjs().to(call.start, true),
                    link: (
                      <Link
                        to={Route.Call.replace(":id", call.id.toString())}
                        className="text-brand underline"
                      >
                        {intl.formatMessage({
                          id: messages[
                            "page.lessons.lesson.join.inprogress.link.label"
                          ],
                        })}
                      </Link>
                    ),
                  }
                )
              : intl.formatMessage(
                  { id: messages["page.lessons.lesson.join"] },
                  {
                    duration: dayjs().to(call.start, true),
                    link: (
                      <Link
                        to={Route.Call.replace(":id", call.id.toString())}
                        className="text-brand underline"
                      >
                        {intl.formatMessage({
                          id: messages["page.lessons.lesson.join.link.label"],
                        })}
                      </Link>
                    ),
                  }
                )}
          </p>
        </div>
      ) : null}

      <WatchLesson
        open={watch.open}
        close={watch.hide}
        callId={call.id}
        title={title}
      />
    </Card>
  );
};

export default Lesson;
