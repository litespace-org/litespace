import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Typography } from "@litespace/ui/Typography";
import { InvoicesOverview as Overview } from "@litespace/ui/InvoicesOverview";
import { useFindInvoiceStats } from "@litespace/headless/invoices";
import React from "react";
import { useOnError } from "@/hooks/error";

export const InvoicesOverview: React.FC<{ tutorId?: number }> = ({
  tutorId,
}) => {
  const intl = useFormatMessage();
  const { query, keys } = useFindInvoiceStats(tutorId);

  useOnError({
    type: "query",
    error: query.error,
    keys,
  });

  return (
    <div className="grid gap-4 sm:gap-6 justify-items-start w-full">
      <Typography
        tag="h1"
        className="text-natural-950 text-body md:text-subtitle-2 font-bold"
      >
        {intl("tutor-invoices.overview.title")}
      </Typography>

      <Overview
        totalRevenue={query.data?.invoices.total || 0}
        availableRevenue={query.data?.spendable || 0}
        pendingInvoicesCount={query.data?.invoices.pending || 0}
        futureRevenue={query.data?.income.future || 0}
        loading={query.isPending}
        error={query.isError}
        retry={query.refetch}
      />
    </div>
  );
};

export default InvoicesOverview;
