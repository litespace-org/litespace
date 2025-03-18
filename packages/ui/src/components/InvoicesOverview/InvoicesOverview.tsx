import { OverviewCard as Card } from "@/components/OverviewCard";
import { useFormatMessage } from "@/hooks";
import { Void } from "@litespace/types";
import React from "react";
import { Loader, LoadingError } from "@/components/Loading";
import ChartSquare from "@litespace/assets/ChartSquare";
import Money from "@litespace/assets/Money";
import TransactionMinus from "@litespace/assets/TransactionMinus";
import EmptyWalletTime from "@litespace/assets/EmptyWalletTime";
import { formatNumber } from "@/components/utils";

export const InvoicesOverview: React.FC<{
  totalRevenue: number;
  availableRevenue: number;
  pendingInvoicesCount: number;
  futureRevenue: number;
  loading: boolean;
  error: boolean;
  retry: Void;
}> = ({
  totalRevenue,
  availableRevenue,
  pendingInvoicesCount,
  futureRevenue,
  loading,
  error,
  retry,
}) => {
  const intl = useFormatMessage();

  if (loading)
    return (
      <div className="flex items-center justify-center w-full h-40">
        <Loader size="medium" text={intl("tutor-invoices.overview.loading")} />
      </div>
    );

  if (error && retry)
    return (
      <div className="flex items-center justify-center w-full h-40">
        <LoadingError
          size="medium"
          error={intl("tutor-invoices.overview.error")}
          retry={retry}
        />
      </div>
    );

  return (
    <div className="w-full grid grid-cols-4 [&>*]:col-span-2 md:[&>*]:col-span-1 gap-4 lg:gap-6 flex-wrap">
      <Card
        icon={
          <ChartSquare className="[&>*]:stroke-natural-50 w-3 h-3 md:w-4 md:h-4" />
        }
        title="tutor-invoices.overview.total-revenue"
        value={intl("global.currency.egp", {
          value: formatNumber(totalRevenue),
        })}
        color="brand"
        className="[&>:nth-child(3)>:nth-child(2)]:text-body [&>:nth-child(3)>:nth-child(2)]:font-bold !gap-[10px] md:gap-2"
      />

      <Card
        icon={<Money className="[&>*]:stroke-natural-50 h-3 md:w-4 md:h-4" />}
        title="tutor-invoices.overview.available-revenue"
        value={intl("global.currency.egp", {
          value: formatNumber(availableRevenue),
        })}
        color="secondary"
        className="[&>:nth-child(3)>:nth-child(2)]:text-body [&>:nth-child(3)>:nth-child(2)]:font-bold !gap-[10px] md:gap-2"
      />

      <Card
        icon={
          <TransactionMinus className="[&>*]:stroke-natural-50 h-3 md:w-4 md:h-4" />
        }
        title="tutor-invoices.overview.pending-invoices-count"
        value={formatNumber(pendingInvoicesCount)}
        color="warning"
        className="[&>:nth-child(3)>:nth-child(2)]:text-body [&>:nth-child(3)>:nth-child(2)]:font-bold !gap-[10px] md:gap-2"
      />

      <Card
        icon={
          <EmptyWalletTime className="[&>*]:stroke-natural-50 h-3 md:w-4 md:h-4" />
        }
        value={intl("global.currency.egp", {
          value: formatNumber(futureRevenue),
        })}
        title="tutor-invoices.overview.future-revenue"
        color="destructive"
        className="[&>:nth-child(3)>:nth-child(2)]:text-body [&>:nth-child(3)>:nth-child(2)]:font-bold !gap-[10px] md:gap-2"
      />
    </div>
  );
};

export default InvoicesOverview;
