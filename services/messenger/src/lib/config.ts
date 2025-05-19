import zod from "zod";

export const envBoolean = zod
  .custom<"true" | "false">((value) => value === "true" || value === "false")
  .transform((value) => value === "true");

const schema = zod.object({
  telegram: zod.object({
    bot: zod.object({
      token: zod.string(),
      chat: zod.coerce.number().negative().int(),
    }),
    client: zod.object({
      id: zod.coerce.number().int().positive(),
      hash: zod.string().trim().length(32),
    }),
  }),
  credentials: zod.object({
    username: zod.string(),
    password: zod.string(),
  }),
  environment: zod.union([
    zod.literal("local"),
    zod.literal("staging"),
    zod.literal("production"),
  ]),
});

export const config = schema.parse({
  telegram: {
    bot: {
      token: process.env.TELEGRAM_BOT_TOKEN,
      chat: process.env.TELEGRAM_BOT_CHAT,
    },
    client: {
      id: process.env.TELEGRAM_CLIENT_API_ID,
      hash: process.env.TELEGRAM_CLIENT_API_HASH,
    },
  },
  credentials: {
    username: process.env.AUTH_USERNAME,
    password: process.env.AUTH_PASSWORD,
  },
  environment: process.env.ENVIRONMENT,
});
