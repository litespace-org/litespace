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
  adminPhoneNumber: zod.string().length(11),
  /**
   * restore file path
   */
  rfp: zod.string(),
});

type ConfigSchema = Zod.infer<typeof schema>;

export const config: ConfigSchema = schema.parse({
  telegram: {
    token: process.env.TELEGRAM_TOKEN,
    chat: process.env.TELEGRAM_CHAT,
  },
  env: process.env.ENVIRONMENT,
  adminPhoneNumber: process.env.ADMIN_PHONE_NUMBER,
  rfp: process.env.RFP,
});

export const spaceConfig = {
  bucketName: zod
    .string({ message: "Missing or invalid digital ocean space bucket name" })
    .trim()
    .parse(process.env.SPACES_BUCKET_NAME),
  accessKeyId: zod
    .string({ message: "Missing or invalid digital ocean space access key" })
    .trim()
    .parse(process.env.SPACES_ACCESS_KEY),
  secretAccessKey: zod
    .string({ message: "Missing or invalid digital ocean space secret key" })
    .trim()
    .parse(process.env.SPACES_SECRET_ACCESS_KEY),
} as const;
