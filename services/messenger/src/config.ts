import zod from "zod";

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
  }),
  credentials: zod.object({
    username: zod.string(),
    password: zod.string(),
  }),
});

export const env = schema.parse({
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
  },
  credentials: {
    username: process.env.USERNAME,
    password: process.env.PASSWORD,
  },
});
