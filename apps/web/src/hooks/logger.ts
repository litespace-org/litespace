import { env } from "@/lib/env";
import { useUser } from "@litespace/headless/context/user";
import { useLogger } from "@litespace/headless/logger";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { useToast } from "@litespace/ui/Toast";
import { useCallback } from "react";
import { useHotkeys } from "react-hotkeys-hook";

export function useSaveLogs(options?: {
  /**
   * @default false
   */
  enableKeyboardShortcut?: boolean;
}) {
  const logger = useLogger();
  const toast = useToast();
  const intl = useFormatMessage();
  const { user } = useUser();

  const save = useCallback(async () => {
    const context = user ? `[context] user=${user.id}` : "[context] N/A";
    await logger.save(context);
    toast.success({
      title: intl("logs.export.title"),
      description: intl("logs.export.desc"),
    });
  }, [intl, logger, toast, user]);

  useHotkeys(
    "ctrl+e",
    save,
    { preventDefault: true, enabled: options?.enableKeyboardShortcut || false },
    [intl, logger, toast, user]
  );

  return { save: env.client === "production" ? () => {} : save };
}
