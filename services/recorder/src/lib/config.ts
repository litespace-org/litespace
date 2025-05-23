import zod from "zod";

const schema = zod.object({
  telegram: zod.object({
    token: zod.string(),
    chat: zod.coerce.number().negative().int(),
  }),
  env: zod.union([
    zod.literal("local"),
    zod.literal("staging"),
    zod.literal("production"),
  ]),
  s3: zod.object({
    key: zod.string(),
    secret: zod.string(),
    bucket: zod.string(),
  }),
});

export type Config = Zod.infer<typeof schema>;

export const config: Config = schema.parse({
  telegram: {
    token: process.env.TELEGRAM_TOKEN,
    chat: process.env.TELEGRAM_CHAT,
  },
  env: process.env.ENVIRONMENT,
  s3: {
    key: process.env.S3_KEY,
    secret: process.env.S3_SECRET,
    bucket: process.env.S3_BUCKET,
  },
});
