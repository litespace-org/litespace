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
  if (!value.expiresAt) return false;

  const expiresAt = dayjs.utc(value.expiresAt);

  if (now.isAfter(expiresAt)) {
    await msg(
      `failed to send ${platform} message to ${value.to} because it has expired since ${expiresAt.from(now)}`
    );
    return true;
  }
  return false;
}
