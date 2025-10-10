import { ILesson, ISessionEvent, IUser } from "@litespace/types";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import dayjs from "@/lib/dayjs";
import { createColumnHelper } from "@tanstack/react-table";
import { useMemo, useCallback } from "react";
import { Table } from "@litespace/ui/Table";
import UserPopover from "@/components/Common/UserPopover";
import { LocalId } from "@litespace/ui/locales";
import {
  calculateAttendanceTime,
  calculatePunctuality,
  getFirstJoinEvent,
  getLastLeaveEvent,
} from "@/lib/lessonEvents";

interface LessonEventsSummaryProps {
  lesson: {
    lesson: ILesson.Self;
    members: ILesson.PopulatedMember[];
  };
  events: {
    tutor: ISessionEvent.MetaSelf[];
    student: ISessionEvent.MetaSelf[];
  };
}

const LessonEventsSummary: React.FC<LessonEventsSummaryProps> = ({
  lesson,
  events,
}) => {
  const intl = useFormatMessage();
  const { lesson: lessonDetails, members } = lesson;
  const sessionStart = dayjs(lessonDetails.start);
  const sessionEnd = sessionStart.add(lessonDetails.duration, "minutes");

  const participants = useMemo(
    () => [
      {
        role: "tutor",
        events: events.tutor,
        member: members.find(
          (m) =>
            m.role === IUser.Role.TutorManager || m.role === IUser.Role.Tutor
        ),
      },
      {
        role: "student",
        events: events.student,
        member: members.find((m) => m.role === IUser.Role.Student),
      },
    ],
    [events, members]
  );

  const getAttendanceTime = useCallback(
    (
      firstJoin: ISessionEvent.MetaSelf | null,
      lastLeave: ISessionEvent.MetaSelf | null
    ) => {
      return calculateAttendanceTime(
        firstJoin,
        lastLeave,
        lessonDetails.duration
      );
    },
    [lessonDetails.duration]
  );

  const getCombinedStatusText = useCallback(
    (
      joinStatus: string,
      leaveStatus: string,
      hasJoined: boolean,
      hasLeft: boolean
    ) => {
      const joinStatusMap: Record<string, LocalId> = {
        "on-time": "dashboard.lesson-events.punctuality.join.on-time",
        early: "dashboard.lesson-events.punctuality.join.early",
        late: "dashboard.lesson-events.punctuality.join.late",
        absent: "dashboard.lesson-events.punctuality.join.absent",
      };

      const leaveStatusMap: Record<string, LocalId> = {
        "on-time": "dashboard.lesson-events.punctuality.leave.on-time",
        early: "dashboard.lesson-events.punctuality.leave.early",
        late: "dashboard.lesson-events.punctuality.leave.late",
        absent: "dashboard.lesson-events.punctuality.leave.absent",
      };

      if (!hasJoined) return intl(joinStatusMap["absent"]);
      if (!hasLeft)
        return `${joinStatusMap[joinStatus]} - ${intl("dashboard.lesson-events.punctuality.leave.absent")}`;

      return `${intl(joinStatusMap[joinStatus])} - ${intl(leaveStatusMap[leaveStatus])}`;
    },
    [intl]
  );

  const columnHelper = createColumnHelper<(typeof participants)[0]>();

  const columns = useMemo(
    () => [
      columnHelper.accessor("member", {
        header: intl("dashboard.lesson-events.participant"),
        cell: (info) => <UserPopover id={info.row.original.member!.userId} />,
      }),
      columnHelper.display({
        id: "combined-status",
        header: intl("dashboard.lesson-events.combined-status"),
        cell: (info) => {
          const events = info.row.original.events as ISessionEvent.MetaSelf[];
          const first = getFirstJoinEvent(events);
          const last = getLastLeaveEvent(events);

          const hasJoined = !!first;
          const hasLeft = !!last;

          const joinStatus = calculatePunctuality(
            first?.createdAt || null,
            sessionStart,
            true
          );

          const leaveStatus = calculatePunctuality(
            last?.createdAt || null,
            sessionEnd,
            false
          );

          const statusText = getCombinedStatusText(
            joinStatus,
            leaveStatus,
            hasJoined,
            hasLeft
          );

          return (
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-normal break-words`}
            >
              {statusText}
            </span>
          );
        },
      }),
      columnHelper.accessor("events", {
        header: intl("dashboard.lesson-events.total-attendance"),
        cell: (info) => {
          const events = info.getValue() as ISessionEvent.MetaSelf[];
          const first = getFirstJoinEvent(events);
          const last = getLastLeaveEvent(events);
          const { minutes, percentage } = getAttendanceTime(first, last);

          return (
            <div className="text-sm font-medium text-gray-900">
              {minutes} {intl("global.labels.minutes")} ({percentage}%)
            </div>
          );
        },
      }),
    ],
    [
      columnHelper,
      getAttendanceTime,
      getCombinedStatusText,
      sessionStart,
      intl,
      sessionEnd,
    ]
  );

  return (
    <div className="rounded-lg shadow overflow-hidden mb-8">
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold">
          {intl("dashboard.lesson-events.attendance-summary")}
        </h3>
      </div>

      <Table
        columns={columns}
        data={participants}
        fetching={false}
        loading={false}
      />
    </div>
  );
};

export default LessonEventsSummary;
