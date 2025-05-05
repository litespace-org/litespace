import React from "react";
import { Typography } from "@litespace/ui/Typography";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Button } from "@litespace/ui/Button";
import { useToast } from "@litespace/ui/Toast";
import { useCancelUnpaidOrder } from "@litespace/headless/fawry";
import { useOnError } from "@/hooks/error";

const PayWithCardStatus: React.FC<{
  transactionId: number;
}> = ({ transactionId }) => {
  const intl = useFormatMessage();
  const toast = useToast();

  const onError = useOnError({
    type: "mutation",
    handler(payload) {
      toast.error({ title: intl(payload.messageId) });
    },
  });

  const cancel = useCancelUnpaidOrder({
    onSuccess() {
      window.location.reload();
    },
    onError,
  });

  return (
    <div className="flex flex-col items-center justify-center gap-6 max-w-[435px]">
      <Typography tag="h1" className="text-subtitle-2 font-bold">
        On-going Card Payment (todo)
      </Typography>

      <Button
        type="main"
        size="large"
        htmlType="submit"
        className="w-full"
        disabled={cancel.isPending}
        loading={cancel.isPending}
        onClick={() => cancel.mutate({ transactionId })}
      >
        {intl("checkout.payment.cancel-and-retry")}
      </Button>
    </div>
  );
};

export default PayWithCardStatus;
