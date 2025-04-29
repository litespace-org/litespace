import React from "react";
import { Typography } from "@litespace/ui/Typography";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Button } from "@litespace/ui/Button";

const PayWithEWalletStatus: React.FC<{
  qr: string,
}> = ({ qr }) => {
  const intl = useFormatMessage();
  return (
    <div className="flex flex-col items-center justify-center gap-6">
      <img src={qr} width={224} height={224} className="mb-4" />

      <div className="flex flex-col gap-2">
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
        className="w-full"
        disabled={false}
        loading={false}
      >
        {intl("labels.close-and-retry")}
      </Button>
    </div>
  );
};

export default PayWithEWalletStatus;
