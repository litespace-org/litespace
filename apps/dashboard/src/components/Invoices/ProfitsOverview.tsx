import React from "react";
import PageTitle from "@/components/Common/PageTitle";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { OverviewCard as Card } from "@litespace/ui/OverviewCard";
import ChartSquare from "@litespace/assets/ChartSquare";
import EmptyWallet from "@litespace/assets/EmptyWalletTime";
import Money from "@litespace/assets/Money";
import TransactionMinus from "@litespace/assets/TransactionMinus";
import { formatNumber } from "@litespace/ui/utils";

const ProfitsOverview: React.FC = () => {
  const intl = useFormatMessage();

  return (
    <div className="flex flex-col gap-6">
      <PageTitle title={intl("invoices.overview.title")} fetching={false} />

      <div className="w-full grid grid-cols-4 gap-4 lg:gap-6 flex-wrap">
        <Card
          icon={
            <ChartSquare className="[&>*]:stroke-natural-50 w-3 h-3 md:w-4 md:h-4" />
          }
          title="invoices.total-requests"
          value={formatNumber(12)}
          color="brand"
          className="col-span-2 lg:col-span-1"
        />
        <Card
          icon={
            <EmptyWallet className="[&>*]:stroke-natural-50 w-3 h-3 md:w-4 md:h-4" />
          }
          title="invoices.pending-requests"
          value={formatNumber(10)}
          color="destructive"
          className="col-span-2 lg:col-span-1"
        />
        <Card
          icon={
            <Money className="[&>*]:stroke-natural-50 w-3 h-3 md:w-4 md:h-4" />
          }
          title="invoices.fulfilled-requests"
          value={formatNumber(13)}
          color="secondary"
          className="col-span-2 lg:col-span-1"
        />
        <Card
          icon={
            <TransactionMinus className="[&>*]:stroke-natural-50 w-3 h-3 md:w-4 md:h-4" />
          }
          title="invoices.rejected-requests"
          value={formatNumber(33)}
          color="warning"
          className="col-span-2 lg:col-span-1"
        />
      </div>
    </div>
  );
};

export default ProfitsOverview;
