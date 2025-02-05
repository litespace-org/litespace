import { Request, Response } from "express";
import safe from "express-async-handler";
import zod from "zod";
import { build } from "@/build";
import { config } from "@/config";

const workspace = zod.union([
  zod.literal("@litespace/apollo"),
  zod.literal("@litespace/server"),
  zod.literal("@litespace/web"),
  zod.literal("@litespace/dashboard"),
  zod.literal("@litespace/landing"),
  zod.literal("@litespace/blog"),
]);

const query = zod.object({ workspace, secret: zod.string() });

async function handler(req: Request, res: Response) {
  const { workspace, secret } = query.parse(req.query);
  if (secret !== config.secret) {
    res.sendStatus(401);
    return;
  }
  await build(workspace);
  res.sendStatus(200);
}

export default safe(handler);
