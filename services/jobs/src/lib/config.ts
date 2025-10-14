import zod from "zod";

const backupMethod = zod
  .literal("dump")
  .or(zod.literal("sql"))
  .or(zod.literal("tar"));

export type BackupMethod = zod.infer<typeof backupMethod>;

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
  backupMethod,
  s3: zod.object({
    bucketName: zod.string().trim(),
    accessKeyId: zod.string().trim(),
    secretAccessKey: zod.string().trim(),
  }),
  whatsAppAPI: zod.object({
    accessToken: zod.string().trim(),
    profileId: zod.coerce.number(),
  }),
  mattermost: zod.object({
    token: zod.string(),
    channel: zod.string(),
  }),
});

type ConfigSchema = Zod.infer<typeof schema>;

export const config: ConfigSchema = schema.parse({
  telegram: {
    token: process.env.TELEGRAM_TOKEN,
    chat: process.env.TELEGRAM_CHAT,
  },
  env: process.env.ENVIRONMENT,
  adminPhoneNumber: process.env.ADMIN_PHONE_NUMBER,
  backupMethod: process.env.BACKUP_METHOD,
  s3: {
    bucketName: process.env.SPACES_BUCKET_NAME,
    accessKeyId: process.env.SPACES_ACCESS_KEY,
    secretAccessKey: process.env.SPACES_SECRET_ACCESS_KEY,
  },
  whatsAppAPI: {
    accessToken: process.env.WHATSAPP_API_ACCESS_TOKEN,
    profileId: process.env.WHATSAPP_API_PROFILE_ID,
  },
  mattermost: {
    token: process.env.MATTERMOST_TOKEN,
    channel: process.env.MATTERMOST_CHANNEL,
  },
});
