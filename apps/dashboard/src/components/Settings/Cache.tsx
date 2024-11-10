import { useFlushCache } from "@litespace/headless/cache";
import {
  Button,
  ButtonSize,
  ButtonType,
  ButtonVariant,
} from "@litespace/luna/Button";
import { Dialog } from "@litespace/luna/Dialog";
import { useFormatMessage } from "@litespace/luna/hooks/intl";
import { useToast } from "@litespace/luna/Toast";
import React, { useCallback, useState } from "react";
import { Typography } from "@litespace/luna/Typography";
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
        <Typography element="h4">{intl("dashboard.settings.title")}</Typography>
        <Typography element="body">
          {intl("dashboard.settings.cache.description")}
        </Typography>
      </div>

      <Button
        size={ButtonSize.Tiny}
        type={ButtonType.Error}
        onClick={() => setOpen(true)}
      >
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
            size={ButtonSize.Tiny}
            type={ButtonType.Error}
            onClick={() => flush.mutate()}
            loading={flush.isPending}
            disabled={flush.isPending}
          >
            {intl("global.labels.confirm")}
          </Button>

          <Button
            size={ButtonSize.Tiny}
            variant={ButtonVariant.Secondary}
            onClick={() => setOpen(false)}
          >
            {intl("global.labels.cancel")}
          </Button>
        </div>
      </Dialog>
    </div>
  );
};

export default Cache;
