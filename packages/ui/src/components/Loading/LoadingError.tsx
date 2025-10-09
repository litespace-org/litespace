import { Button } from "@/components/Button";
import { useToast } from "@/components/Toast";
import { Typography } from "@/components/Typography";
import { useFormatMessage } from "@/hooks/intl";
import ExclaimationMarkCircle from "@litespace/assets/ExclaimationMarkCircle";
import { useLogger } from "@litespace/headless/logger";
import { Void } from "@litespace/types";
import { LITESPACE_SUPPORT_URL, safePromise } from "@litespace/utils";
import cn from "classnames";
import React, { useCallback, useState } from "react";

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
      customAction: (
        <a href={LITESPACE_SUPPORT_URL} target="_blank" className="w-full mt-4">
          <Button type="success" size="large" className="text w-full">
            {intl("labels.contact-us")}
          </Button>
        </a>
      ),
    });
  }, [intl, logger, toast]);

  return (
    // NOTE: don't specify a size for it, do it in the parent component.
    // TODO: make width here full.
    <div className="flex flex-col items-center justify-center mx-auto">
      <div
        className={cn(
          "flex items-center justify-center rounded-full bg-destructive-200 p-[2.5px]",
          {
            "w-8 h-8": size === "small",
            "w-16 h-16": size === "medium",
            "w-20 h-20": size === "large",
          }
        )}
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
          className="w-full text-tiny _whitespace-nowrap"
        >
          {intl("labels.retry")}
        </Button>
        <Button
          size={size === "large" ? "medium" : "small"}
          variant="secondary"
          className="w-full text-tiny"
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
