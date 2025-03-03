import { useFlushCache } from "@litespace/headless/cache";
import { Button } from "@litespace/ui/Button";
import { Dialog } from "@litespace/ui/Dialog";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { useToast } from "@litespace/ui/Toast";
import React, { useCallback, useState } from "react";
import { Typography } from "@litespace/ui/Typography";
import cn from "classnames";

const Cache: React.FC = () => {
  const intl = useFormatMessage();
  const [open, setOpen] = useState(false);
  const toast = useToast();

  const onSuccess = useCallback(() => {
    setOpen(false);
    toast.success({
      title: intl("dashboard.settings.cache.delete.success"),
    });
  }, [intl, toast]);

  const onError = useCallback(
    (error: Error) => {
      toast.error({
        title: intl("dashboard.settings.cache.delete.error"),
        description: error.message,
      });
    },
    [intl, toast]
  );

  const flush = useFlushCache({ onSuccess, onError });

  return (
    <div className={cn("flex flex-col gap-4")}>
      <div>
        <Typography tag="h4" className="text-h4">
          {intl("dashboard.settings.title")}
        </Typography>
        <Typography tag="p" className="text-body">
          {intl("dashboard.settings.cache.description")}
        </Typography>
      </div>

      <Button size={"small"} type={"error"} onClick={() => setOpen(true)}>
        {intl("global.labels.delete")}
      </Button>
      <Dialog
        open={open}
        setOpen={setOpen}
        title={intl("dashboard.settings.cache.alert.title")}
        close={() => setOpen(false)}
        description={intl("dashboard.settings.cache.alert.description")}
        className="max-w-[50rem]"
      >
        <div className="flex gap-4">
          <Button
            size={"small"}
            type={"error"}
            onClick={() => flush.mutate()}
            loading={flush.isPending}
            disabled={flush.isPending}
          >
            {intl("labels.confirm")}
          </Button>

          <Button
            size={"small"}
            variant={"secondary"}
            onClick={() => setOpen(false)}
          >
            {intl("labels.cancel")}
          </Button>
        </div>
      </Dialog>
    </div>
  );
};

export default Cache;
