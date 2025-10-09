import { useOnError } from "@/hooks/error";
import { useRefund } from "@litespace/headless/fawry";
import { useMediaQuery } from "@litespace/headless/mediaQuery";
import { useFindRefundableAmount } from "@litespace/headless/transaction";
import { Void } from "@litespace/types";
import { Button } from "@litespace/ui/Button";
import { Dialog } from "@litespace/ui/Dialog";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { useToast } from "@litespace/ui/Toast";
import { Typography } from "@litespace/ui/Typography";
import { price } from "@litespace/utils";
import React, { useMemo } from "react";

const RefundDialog: React.FC<{
  txId: number;
  orderRefNum: string;
  isOpen: boolean;
  close: Void;
}> = ({ txId, orderRefNum, isOpen, close }) => {
  const intl = useFormatMessage();
  const toast = useToast();
  const mq = useMediaQuery();

  const tx = useFindRefundableAmount(txId);

  const amount = useMemo(() => tx.query.data || 0, [tx.query.data]);

  const onError = useOnError({
    type: "mutation",
    handler: (e) => toast.error({ title: intl(e.messageId) }),
  });

  const refund = useRefund({
    // TODO: improve this by revalidating the up query
    onSuccess: () => document.location.reload(),
    onError,
  });

  if (amount <= 0)
    return (
      <Dialog
        open={isOpen}
        close={refund.isPending ? undefined : close}
        title={
          <Typography tag="h1" className="text-subtitle-2 font-bold">
            {intl("student-settings.refunds.dialog.cannot-refund.title")}
          </Typography>
        }
        className="w-full sm:max-w-[500px]"
        position={mq.md ? "center" : "bottom"}
      >
        <Typography tag="p" className="text-normal mt-4 mb-6">
          {intl("student-settings.refunds.dialog.cannot-refund.description")}
        </Typography>

        <Button
          variant="primary"
          size="large"
          className="w-full"
          onClick={close}
        >
          {intl("labels.ok")}
        </Button>
      </Dialog>
    );

  return (
    <Dialog
      open={isOpen}
      close={refund.isPending ? undefined : close}
      title={
        <Typography tag="h1" className="text-subtitle-2 font-bold">
          {intl("student-settings.refunds.dialog.title")}
        </Typography>
      }
      className="w-full sm:max-w-[500px]"
      position={mq.md ? "center" : "bottom"}
    >
      <Typography tag="p" className="text-normal mt-4 mb-2">
        {intl("student-settings.refunds.dialog.description")}
      </Typography>

      <Typography tag="p" className="text-normal mt-4 mb-2">
        {intl("student-settings.refunds.dialog.amount", {
          amount: price.unscale(amount),
        })}
      </Typography>

      <div className="flex flex-col items-center gap-4 mt-8">
        <div className="flex w-full gap-4">
          <Button
            type="error"
            className="flex-1"
            size="large"
            loading={refund.isPending || tx.query.isPending}
            disabled={refund.isPending || tx.query.isPending || amount <= 0}
            onClick={() => refund.mutate({ orderRefNum })}
          >
            {intl("student-settings.refunds.button.refund")}
          </Button>
          <Button
            variant="secondary"
            type="error"
            className="flex-1"
            size="large"
            disabled={refund.isPending}
            onClick={close}
          >
            {intl("labels.go-back")}
          </Button>
        </div>
      </div>
    </Dialog>
  );
};

export default RefundDialog;
