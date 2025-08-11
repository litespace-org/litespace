import { useCallback, useState } from "react";
import { useOnError } from "@/hooks/error";
import { useCreateCheckoutUrl } from "@litespace/headless/paymob";
import { IPlan, ITransaction } from "@litespace/types";
import { Button } from "@litespace/ui/Button";
import { IframeDialog } from "@litespace/ui/IframeDilaog";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import cn from "classnames";

const PayWithPaymob: React.FC<{
  className?: string;
  planId: number;
  planPeriod: IPlan.Period;
  paymentMethod:
    | ITransaction.PaymentMethod.Card
    | ITransaction.PaymentMethod.EWallet;
}> = ({ className, planId, planPeriod, paymentMethod }) => {
  const intl = useFormatMessage();
  const [url, setUrl] = useState("");

  const onError = useOnError({
    type: "mutation",
    handler: (err) => {
      console.error(err);
    },
  });

  const createCheckoutUrl = useCreateCheckoutUrl({
    onSuccess: ({ checkoutUrl }) => setUrl(checkoutUrl),
    onError,
  });

  const onClickHandler = useCallback(() => {
    createCheckoutUrl.mutate({
      planId,
      planPeriod,
      paymentMethod,
    });
  }, [createCheckoutUrl, planId, planPeriod, paymentMethod]);

  return (
    <>
      <Button
        size="large"
        className={cn("text font-semibold text-lg", className)}
        onClick={onClickHandler}
      >
        {intl("labels.pay-with-paymob")}
      </Button>
      <IframeDialog
        open={createCheckoutUrl.isPending || !!url}
        onOpenChange={(value) => {
          if (value === false) setUrl("");
        }}
        url={url}
        loading={createCheckoutUrl.isPending}
      />
    </>
  );
};

export default PayWithPaymob;
