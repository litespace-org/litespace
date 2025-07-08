import { Request, Response } from "express";
import safe from "express-async-handler";
import zod from "zod";
import { build } from "@/build";
import { config, staging } from "@/config";
import { WORKSPACES } from "@/constants";
import { Workspace } from "@/types";
import { telegram } from "@/telegram";

const workspaces = zod.union([
  zod.string().transform((raw, ctx): Workspace[] => {
    const workspaces = raw.split(",");

    const final: Workspace[] = [];

    for (const workspace of workspaces) {
      if (!WORKSPACES.includes(workspace as Workspace))
        ctx.addIssue({
          code: zod.ZodIssueCode.custom,
          message: `"${workspace}" is not a valid workspace name`,
        });
      else final.push(workspace as Workspace);
    }

    return final;
  }),
  zod.literal("all"),
]);

const query = zod.object({ workspaces, secret: zod.string() });

async function handler(req: Request, res: Response) {
  const { workspaces, secret } = query.parse(req.query);
  if (secret !== config.secret) {
    res.sendStatus(401);
    return;
  }

  await telegram.sendMessage({
    chat: config.telegram.chat,
    text: staging
      ? `Started a staging deployment`
      : "Started a production deployment",
  });

  build(workspaces).then(() => {
    telegram.sendMessage({
      chat: config.telegram.chat,
      text: [
        staging ? "*Staging Server Update*" : "Production Server Update",
        workspaces === "all"
          ? `- All workspaces are up to date`
          : "Updated workspaces: ",
        (workspaces !== "all"
          ? workspaces.map((workspace) => workspace.replace("@", "- "))
          : []
        ).join("\n"),
        `*Links:*`,
        staging
          ? "- https://app.staging.litespace.org"
          : "- https://app.litespace.org",
        staging
          ? "- https://landing.staging.litespace.org"
          : "- https://litespace.org",
        staging
          ? "- https://dashboard.staging.litespace.org"
          : "- https://dashboard.litespace.org",
        staging
          ? "- https://blog.staging.litespace.org"
          : "- https://blog.litespace.org",
        staging
          ? `- https://api.staging.litespace.org`
          : "- https://api.litespace.org",
        staging
          ? "- https://peer.staging.litespace.org"
          : "- https://peer.litespace.org",
      ]
        .filter((line) => !!line)
        .join("\n"),
    });
  });

  res.sendStatus(200);
}

export default safe(handler);
