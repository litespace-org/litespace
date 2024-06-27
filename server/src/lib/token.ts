import { IToken } from "@litespace/types";
import dayjs from "@/lib/dayjs";

export function isValidToken(
  token: IToken.Self | null,
  type: IToken.Type
): token is IToken.Self {
  const active = !!token && dayjs.utc().isBefore(dayjs.utc(token.expiresAt));
  return active && !token.used && token.type === type;
}
