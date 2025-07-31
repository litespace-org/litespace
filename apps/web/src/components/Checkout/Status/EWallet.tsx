import React, { useMemo } from "react";
import { Typography } from "@litespace/ui/Typography";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Button } from "@litespace/ui/Button";
import { walletPaymentQrCode } from "@/lib/cache";
import { Void } from "@litespace/types";

const Status: React.FC<{
  cancel: Void;
  canceling: boolean;
  disabled: boolean;
}> = ({ cancel, canceling, disabled }) => {
  const qr = useMemo(() => walletPaymentQrCode.get(), []);

  return (
    <div className="flex flex-col items-center justify-center gap-6 max-w-[435px] mt-2 lg:-mt-2">
      {qr ? (
        <QrPayment
          cancel={cancel}
          canceling={canceling}
          qr={qr}
          disabled={disabled}
        />
      ) : null}

      {!qr ? (
        <RequestToPayPayment
          cancel={cancel}
          canceling={canceling}
          disabled={disabled}
        />
      ) : null}
    </div>
  );
};

const QrPayment: React.FC<{
  qr: string;
  cancel: Void;
  canceling: boolean;
  disabled: boolean;
}> = ({ qr, cancel, canceling, disabled }) => {
  const intl = useFormatMessage();

  return (
    <div className="flex flex-col items-center justify-center gap-10 lg:gap-6">
      <img src={qr} className="w-72 h-72" />

      <div className="flex flex-col items-center justify-center gap-4 md:gap-6 lg:gap-4">
        <div className="flex flex-col items-center justify-center text-center gap-2">
          <Typography tag="h1" className="text-subtitle-1 font-bold">
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
          disabled={canceling || disabled}
          loading={canceling}
          onClick={cancel}
          className="w-full sm:w-auto"
        >
          <Typography tag="span" className="text text-body font-medium">
            {intl("checkout.payment.cancel-and-retry")}
          </Typography>
        </Button>
      </div>
    </div>
  );
};

const RequestToPayPayment: React.FC<{
  cancel: Void;
  canceling: boolean;
  disabled: boolean;
}> = ({ cancel, canceling, disabled }) => {
  const intl = useFormatMessage();
  return (
    <div className="flex flex-col items-center justify-center gap-6 lg:gap-4">
      <div className="flex flex-col gap-2">
        <Typography tag="h1" className="text-subtitle-1 font-bold text-center">
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
        disabled={canceling || disabled}
        loading={canceling}
        onClick={cancel}
        className="w-full sm:w-auto"
      >
        <Typography tag="span" className="text text-body font-medium">
          {intl("checkout.payment.cancel-and-retry")}
        </Typography>
      </Button>
    </div>
  );
};

export default Status;
