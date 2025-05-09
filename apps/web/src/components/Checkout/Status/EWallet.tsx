import React, { useMemo } from "react";
import { Typography } from "@litespace/ui/Typography";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Button } from "@litespace/ui/Button";
import { walletPaymentQrCode } from "@/lib/cache";
import { Void } from "@litespace/types";

const QrPayment: React.FC<{ qr: string; cancel: Void; canceling: boolean }> = ({
  qr,
  cancel,
  canceling,
}) => {
  const intl = useFormatMessage();

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <img src={qr} width={224} height={224} />

      <div className="flex flex-col items-center justify-center gap-4">
        <div className="flex flex-col items-center justify-center text-center gap-2">
          <Typography tag="h1" className="text-subtitle-2 font-bold">
            {intl("checkout.status.ewallet.title")}
          </Typography>

          <Typography tag="p" className="text-body font-normal">
            {intl("checkout.status.ewallet.description")}
          </Typography>
        </div>

        <Button
          type="main"
          size="large"
          htmlType="submit"
          disabled={canceling}
          loading={canceling}
          onClick={cancel}
        >
          {intl("checkout.payment.cancel-and-retry")}
        </Button>
      </div>
    </div>
  );
};

const RequestToPayPayment: React.FC<{
  cancel: Void;
  canceling: boolean;
}> = ({ cancel, canceling }) => {
  const intl = useFormatMessage();
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="flex flex-col gap-2">
        <Typography tag="h1" className="text-subtitle-2 font-bold text-center">
          {intl("checkout.status.ewallet.title-2")}
        </Typography>

        <Typography tag="p" className="text-body font-normal text-center">
          {intl("checkout.status.ewallet.description-2")}
        </Typography>
      </div>

      <Button
        type="main"
        size="large"
        htmlType="submit"
        disabled={canceling}
        loading={canceling}
        onClick={cancel}
      >
        {intl("checkout.payment.cancel-and-retry")}
      </Button>
    </div>
  );
};

const PayWithEWalletStatus: React.FC<{
  cancel: Void;
  canceling: boolean;
}> = ({ cancel, canceling }) => {
  const qr = useMemo(() => walletPaymentQrCode.get(), []);

  return (
    <div className="flex flex-col items-center justify-center gap-6 max-w-[435px]">
      {qr ? <QrPayment cancel={cancel} canceling={canceling} qr={qr} /> : null}

      {!qr ? (
        <RequestToPayPayment cancel={cancel} canceling={canceling} />
      ) : null}
    </div>
  );
};

export default PayWithEWalletStatus;
