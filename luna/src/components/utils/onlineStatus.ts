import { UserOnlineStatus } from "@/components/OnlineStatus";
import dayjs from "@/lib/dayjs";

export function asOnlineStatus(online?: boolean, updatedAt?: string) {
  if (!online || !updatedAt) return UserOnlineStatus.InActive;
  if (online) return UserOnlineStatus.Active;
  const now = dayjs();
  const recently = dayjs(updatedAt).isBetween(now, now.subtract(1, "hour"));
  if (recently) return UserOnlineStatus.WasActive;
  return UserOnlineStatus.InActive;
}
