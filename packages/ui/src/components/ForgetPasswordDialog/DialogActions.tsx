import React from "react";
import { Button } from "@/components/Button";
import { Typography } from "@/components/Typography";
import { useFormatMessage } from "@/hooks";
import { Void } from "@litespace/types";
import { LocalId } from "@/locales";

export const DialogActions: React.FC<{
  loading?: boolean;
  confirmId: LocalId;
  submit: Void;
  close: Void;
}> = ({ loading, confirmId, submit, close }) => {
  const intl = useFormatMessage();

  return (
    <div className="flex gap-4 md:gap-6 mt-8 md:mt-12">
      <Button
        size="large"
        className="flex-1"
        htmlType="submit"
        loading={loading}
        disabled={loading}
        onClick={submit}
      >
        <Typography tag="span" className="text-body font-medium">
          {intl(confirmId)}
        </Typography>
      </Button>
      <Button
        htmlType="button"
        onClick={close}
        size="large"
        variant="secondary"
        className="flex-1"
        disabled={loading}
      >
        <Typography tag="span" className="text-body font-medium">
          {intl("labels.cancel")}
        </Typography>
      </Button>
    </div>
  );
};

export default DialogActions;
