import ExclaimationMarkCircle from "@litespace/assets/ExclaimationMarkCircle";
import { Button } from "@/components/Button";
import { useFormatMessage } from "@/hooks/intl";
import { Typography } from "@/components/Typography";
import { Void } from "@litespace/types";
import React, { useCallback, useState } from "react";
import cn from "classnames";
import { useLogger } from "@litespace/headless/logger";
import { useUserContext } from "@litespace/headless/context/user";
import { useToast } from "@/components/Toast";
import { safePromise } from "@litespace/utils";

export const LoadingError: React.FC<{
  retry: Void;
  error: string;
  size?: "small" | "medium" | "large";
  className?: string;
}> = ({ retry, error, size = "small", className }) => {
  const intl = useFormatMessage();
  const logger = useLogger();
  const toast = useToast();
  const { user } = useUserContext();
  const [saving, setSaving] = useState<boolean>(false);

  const save = useCallback(async () => {
    const context = `[context] user=${user?.id || "??"}, url=${window.location.href}`;
    setSaving(true);
    const result = await safePromise(logger.save(context));
    setSaving(false);
    // todo: show a toast error to the user
    if (result instanceof Error)
      return logger.error("Failed to export logs", result);
    toast.success({
      title: intl("logs.export.title"),
      description: intl("logs.export.desc"),
    });
  }, [intl, logger, toast, user?.id]);

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center w-[226px]",
        className
      )}
    >
      <div
        className={cn(
          "flex items-center justify-center bg-destructive-200 rounded-full",
          {
            "p-[3.33px] w-10 h-10": size === "small",
            "p-[5.33px] w-16 h-16": size === "medium",
            "p-[6.67px] w-20 h-20": size === "large",
          }
        )}
      >
        <ExclaimationMarkCircle />
      </div>
      <Typography
        tag="span"
        className={cn("text-natural-950 text-center mt-6 sm:mt-4 mb-4", {
          "text-tiny font-semibold": size === "small",
          "text-caption font-normal": size !== "small",
        })}
      >
        {error}
      </Typography>
      <div className="flex flex-row items-center justify-center gap-4 w-full">
        <Button
          size={size === "large" ? "medium" : "small"}
          onClick={retry}
          variant="primary"
          className="w-full"
        >
          {intl("labels.retry")}
        </Button>
        <Button
          size={size === "large" ? "medium" : "small"}
          variant="secondary"
          className="w-full"
          disabled={saving}
          loading={saving}
          onClick={save}
        >
          {intl("labels.report")}
        </Button>
      </div>
    </div>
  );
};
