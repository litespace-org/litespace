import { ISessionEvent } from "@litespace/types";
import dayjs from "@/lib/dayjs";

export const getFirstJoinEvent = (events: ISessionEvent.MetaSelf[]) => {
  return events
    .filter((event) => event.type === 1)
    .sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    )[0];
};

export const getLastLeaveEvent = (events: ISessionEvent.MetaSelf[]) => {
  return events
    .filter((event) => event.type === 2)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0];
};

export const calculatePunctuality = (
  eventTime: string | null,
  sessionTime: dayjs.Dayjs,
  isJoin: boolean
) => {
  if (!eventTime) return "absent";

  const event = dayjs(eventTime);
  const diffMinutes = event.diff(sessionTime, "minute");

  // For join: [-3, +1] = on time, < -3 = early, > +1 = late
  // For leave: [-1, +3] = on time, < -1 = early, > +3 = late
  const [earlyThreshold, onTimeStart, onTimeEnd, lateThreshold] = isJoin
    ? [-3, -3, 1, 1]
    : [-1, -1, 3, 3];

  if (diffMinutes >= onTimeStart && diffMinutes <= onTimeEnd) return "on-time";
  if (isJoin ? diffMinutes < earlyThreshold : diffMinutes < lateThreshold)
    return "early";
  return "late";
};

export const calculateAttendanceTime = (
  firstJoin: ISessionEvent.MetaSelf | null,
  lastLeave: ISessionEvent.MetaSelf | null,
  duration: number
) => {
  if (!firstJoin || !lastLeave) return { minutes: 0, percentage: 0 };

  const start = dayjs(firstJoin.createdAt);
  const end = dayjs(lastLeave.createdAt);
  const minutes = end.diff(start, "minute");

  return {
    minutes,
    percentage: Math.min(100, Math.round((minutes / duration) * 100)),
  };
};
