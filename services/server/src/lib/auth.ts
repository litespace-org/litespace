import jwt from "jsonwebtoken";
import { authorizationSecret } from "@/constants";

export function generateAuthorizationToken(id: number) {
  return jwt.sign({ id }, authorizationSecret, { expiresIn: "7d" });
}

export function decodeAuthorizationToken(token: string): number {
  const { id } = jwt.verify(token, authorizationSecret) as {
    id: number;
  };
  return id;
}
