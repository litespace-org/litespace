import path from "node:path";
import zod from "zod";
import fs from "node:fs";

const schema = zod
  .object({
    branch: zod.union([zod.literal("master"), zod.literal("production")]),
    repo: zod.string(),
    port: zod.number().positive().int(),
    host: zod.string().ip(),
    secret: zod.string(),
    telegram: zod.object({
      token: zod.string(),
      chat: zod.coerce.number().negative().int(),
    }),
  })
  .superRefine((data, ctx) => {
    if (!fs.existsSync(data.repo) || !path.isAbsolute(data.repo))
      ctx.addIssue({
        code: zod.ZodIssueCode.custom,
        message: `"${data.repo}" is not a valid path`,
      });
  });

type ConfigSchema = Zod.infer<typeof schema>;

function parseConfig(): ConfigSchema {
  const dirname = path.dirname(__dirname);
  const config = path.join(dirname, "config.json");

  const exists = fs.existsSync(config);
  if (!exists)
    throw new Error("Missing config.json file; Refer to config.example.json");

  const content = fs.readFileSync(config).toString("utf-8");
  return schema.parse(JSON.parse(content));
}

export const config = parseConfig();
