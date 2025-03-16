import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Typography } from "@litespace/ui/Typography";
import { InvoicesOverview as Overview } from "@litespace/ui/InvoicesOverview";
import { useFindInvoiceStats } from "@litespace/headless/invoices";
import React from "react";

export const InvoicesOverview: React.FC<{ tutorId?: number }> = ({
  tutorId,
}) => {
  const intl = useFormatMessage();
  const statsQuery = useFindInvoiceStats(tutorId);

  return (
    <div className="grid gap-4 sm:gap-6 justify-items-start w-full">
      <Typography
        tag="h1"
        className="text-natural-950 text-body md:text-subtitle-2 font-bold"
      >
        {intl("tutor-invoices.overview.title")}
      </Typography>

      <Overview
        totalRevenue={statsQuery.data?.invoices.total || 0}
        availableRevenue={statsQuery.data?.spendable || 0}
        pendingInvoicesCount={statsQuery.data?.invoices.pending || 0}
        futureRevenue={statsQuery.data?.income.future || 0}
        loading={statsQuery.isPending}
        error={statsQuery.isError}
        retry={statsQuery.refetch}
      />
    </div>
  );
};

export default InvoicesOverview;
