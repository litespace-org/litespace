import { jwtSecret } from "@/constants";
import { encodeJwt } from "@litespace/auth";

export function generateJwtToken(id: number): string {
  return encodeJwt(id, jwtSecret);
}
