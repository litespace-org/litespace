import { BackupMethod } from "@/lib/config";

export const MAX_BACKUPS = 30;
export const LITESPACE_DATABASE_S3_BACKUP_PATH = "backups/db/litespace";

export const PG_FORMAT_FLAG_MAP: Record<BackupMethod, string> = {
  sql: "-Fp",
  tar: "-Ft",
  dump: "-Fc",
} as const;
