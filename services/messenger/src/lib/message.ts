import { IKafka } from "@litespace/types";
import dayjs from "@/lib/dayjs";
import { msg } from "@/lib/bot";

export async function isExpired<T extends IKafka.TopicType>({
  value,
  platform,
}: {
  value: IKafka.ValueOf<T>;
  platform: IKafka.TopicType;
}) {
  const now = dayjs.utc();
  // if no expiry time then we don't need to check for expiration
  if (!value.expiryTime) return false;

  const expiryTime = dayjs.utc(value.expiryTime);

  if (now.isAfter(expiryTime)) {
    await msg(
      `failed to send ${platform} message to ${value.to} because it has expired since ${expiryTime.from(now)}`
    );
    return true;
  }
  return false;
}
