import zod from "zod";

export const envBoolean = zod
  .custom<"true" | "false">((value) => value === "true" || value === "false")
  .transform((value) => value === "true");

const schema = zod.object({
  port: zod.coerce.number().positive().int(),
  telegram: zod.object({
    bot: zod.object({
      token: zod.string(),
      chat: zod.coerce.number().negative().int(),
    }),
    client: zod.object({
      id: zod.coerce.number().int().positive(),
      hash: zod.string().trim().length(32),
    }),
    enabled: envBoolean.default("true"),
  }),
  whatsapp: zod.object({
    enabled: envBoolean.default("true"),
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
  port: process.env.PORT,
  telegram: {
    bot: {
      token: process.env.TELEGRAM_BOT_TOKEN,
      chat: process.env.TELEGRAM_BOT_CHAT,
    },
    client: {
      id: process.env.TELEGRAM_CLIENT_API_ID,
      hash: process.env.TELEGRAM_CLIENT_API_HASH,
    },
    enabled: process.env.ENABLE_TELEGRAM,
  },
  whatsapp: {
    enabled: process.env.ENABLE_WHATSAPP,
  },
  credentials: {
    username: process.env.USERNAME,
    password: process.env.PASSWORD,
  },
  environment: process.env.ENVIRONMENT,
});
