import ExclaimationMarkCircle from "@litespace/assets/ExclaimationMarkCircle";
import { Button } from "@/components/Button";
import { useFormatMessage } from "@/hooks/intl";
import { Typography } from "@/components/Typography";
import { Void } from "@litespace/types";
import React, { useCallback, useState } from "react";
import cn from "classnames";
import { useLogger } from "@litespace/headless/logger";
import { useToast } from "@/components/Toast";
import { safePromise } from "@litespace/utils";

export const LoadingError: React.FC<{
  retry: Void;
  error?: string;
  size?: "small" | "medium" | "large";
}> = ({ retry, error, size = "small" }) => {
  const intl = useFormatMessage();
  const logger = useLogger();
  const toast = useToast();
  const [saving, setSaving] = useState<boolean>(false);

  const save = useCallback(async () => {
    setSaving(true);
    const result = await safePromise(logger.save());
    setSaving(false);
    // todo: show a toast error to the user
    if (result instanceof Error)
      return logger.error("Failed to export logs", result);
    toast.success({
      title: intl("logs.export.title"),
      description: intl("logs.export.desc"),
    });
  }, [intl, logger, toast]);

  return (
    <div className="flex flex-col items-center justify-center w-[226px]">
      <div
        className={cn("flex items-center justify-center rounded-full", {
          "w-8 h-8": size === "small",
          "w-16 h-16": size === "medium",
          "w-20 h-20": size === "large",
        })}
      >
        <ExclaimationMarkCircle />
      </div>
      <Typography
        tag="span"
        className={cn("text-natural-950 text-center mt-6 sm:mt-4 mb-4", {
          "text-tiny font-normal": size === "small",
          "text-caption font-semibold": size !== "small",
        })}
      >
        {error || intl("error.loading-error")}
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
