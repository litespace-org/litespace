import { jwtSecret } from "@/constants";
import { encodeAuthJwt } from "@litespace/auth";

export function generateJwtToken(id: number): string {
  return encodeAuthJwt(id, jwtSecret);
}
