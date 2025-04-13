import zod from "zod";

const schema = zod.object({
  telegram: zod.object({
    token: zod.string(),

    chat: zod.coerce.number().negative().int(),
  }),
  telegramBot: zod.object({
    token: zod.string(),
    chat: zod.coerce.number().negative().int(),
  }),
  env: zod.union([
    zod.literal("local"),
    zod.literal("staging"),
    zod.literal("production"),
  ]),
});

type ConfigSchema = Zod.infer<typeof schema>;

export const config: ConfigSchema = schema.parse({
  telegram: {
    token: process.env.TELEGRAM_TOKEN,
    chat: process.env.TELEGRAM_CHAT,
  },
  env: process.env.ENVIRONMENT,
});
