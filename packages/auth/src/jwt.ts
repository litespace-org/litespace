import jwt from "jsonwebtoken";
import zod from "zod";

const jwtPayload = zod.object({
  id: zod.number().int().positive(),
});

export function encodeAuthJwt(id: number, secret: string): string {
  return jwt.sign({ id }, secret, {
    expiresIn: "7d",
  });
}

export function decodeAuthJwt(token: string, secret: string): number {
  const decoded = jwt.verify(token, secret);
  const { id } = jwtPayload.parse(decoded);
  return id;
}
