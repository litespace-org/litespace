import { Request, Response } from "express";
import safe from "express-async-handler";
import zod from "zod";
// import { build } from "@/build";
import { config } from "@/config";
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
  // await build(workspaces);

  await telegram.sendMessage({
    chat: config.telegram.chat,
    text: [
      "*Staging Server Update*",
      workspaces === "all"
        ? `- All workspaces are up to date`
        : "Updated workspaces: ",
      (workspaces !== "all"
        ? workspaces.map((workspace) => workspace.replace("@", "- "))
        : []
      ).join("\n"),
      `*Staging links:*`,
      `- app.staging.litespace.org`,
      `- landing.staging.litespace.org`,
      `- dashboard.staging.litespace.org`,
      `- blog.staging.litespace.org`,
      `- api.staging.litespace.org`,
      `- peer.staging.litespace.org`,
    ]
      .filter((line) => !!line)
      .join("\n"),
  });
  res.sendStatus(200);
}

export default safe(handler);
