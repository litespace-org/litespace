import dayjs from "@/lib/dayjs";
import { ISessionEvent } from "@litespace/types";

const MIN_ATTENDANCE_REQUIRED = 0.25;

export function evaluateAttendance({
  events,
  userIds,
  duration,
}: {
  events: ISessionEvent.Self[];
  userIds: number[];
  duration: number;
}): Record<number, boolean> {
  const attendanceStatus: Record<number, boolean> = Object.fromEntries(
    userIds.map((id) => [id, false])
  );

  const userEventsMap = new Map<number, ISessionEvent.Self[]>();

  events.forEach((event) => {
    if (userIds.includes(event.userId)) {
      if (!userEventsMap.has(event.userId)) userEventsMap.set(event.userId, []);

      userEventsMap.get(event.userId)?.push(event);
    }
  });

  userEventsMap.forEach((events, userId) => {
    let totalTime = 0;
    let lastJoinTime: number | null = null;

    for (const event of events) {
      if (event.type === ISessionEvent.EventType.UserJoined) {
        if (lastJoinTime !== null) continue;

        lastJoinTime = dayjs.utc(event.createdAt).valueOf();
      }

      if (event.type === ISessionEvent.EventType.UserLeft) {
        if (lastJoinTime === null) continue;

        const leftTime = dayjs.utc(event.createdAt).valueOf();
        totalTime += leftTime - lastJoinTime;
        lastJoinTime = null;
      }
    }

    const minAttendanceMs = MIN_ATTENDANCE_REQUIRED * duration * 60 * 1000; // minimum attendance in ms

    console.log({ minAttendanceMs, totalTime });

    attendanceStatus[userId] = totalTime >= minAttendanceMs;
  });

  return attendanceStatus;
}
