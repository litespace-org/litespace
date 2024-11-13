import { useFormatMessage } from "@litespace/luna/hooks/intl";
import { Loading } from "@litespace/luna/Loading";
import { IInvoice, Void } from "@litespace/types";
import React, { useMemo } from "react";
import ErrorElement from "@/components/common/Error";
import LablesTable, { TableLablesRow } from "@/components/common/LabelsTable";
import { formatCurrency } from "@litespace/luna/utils";

const StatsContent: React.FC<{
  loading: boolean;
  error: Error | null;
  data?: IInvoice.StatsApiResponse | null;
  refetch: Void;
}> = ({ loading, error, data, refetch }) => {
  const intl = useFormatMessage();

  const labels = useMemo((): TableLablesRow[] => {
    if (!data) return [];
    return [
      {
        label: intl("stats.tutor.income.total"),
        value: formatCurrency(data.income.total),
      },
      {
        label: intl("stats.tutor.income.future"),
        value: formatCurrency(data.income.future),
      },
      {
        label: intl("stats.tutor.income.past"),
        value: formatCurrency(data.income.past),
      },
      {
        label: intl("stats.tutor.invoices.total"),
        value: formatCurrency(data.invoices.total),
      },
      {
        label: intl("stats.tutor.invoices.fulfilled"),
        value: formatCurrency(data.invoices.fulfilled),
      },
      {
        label: intl("stats.tutor.invoices.pending"),
        value: formatCurrency(data.invoices.pending),
      },
      {
        label: intl("stats.tutor.spendable"),
        value: formatCurrency(data.spendable),
      },
    ];
  }, [data, intl]);

  if (loading) return <Loading className="h-64" />;

  if (error)
    return (
      <ErrorElement
        title={intl("stats.tutor.fetching.error")}
        error={error}
        refetch={refetch}
      />
    );

  return <LablesTable rows={labels} />;
};

export default StatsContent;
