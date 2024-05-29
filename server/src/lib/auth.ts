import jwt from "jsonwebtoken";
import { authorizationSecret } from "@/constants";

export function generateAuthorizationToken(id: number) {
  return jwt.sign({ id }, authorizationSecret, { expiresIn: "7d" });
}
