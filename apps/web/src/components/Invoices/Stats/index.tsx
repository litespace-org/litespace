import { Button } from "@litespace/ui/Button";
import { LocalId } from "@litespace/ui/locales";
import { Spinner } from "@litespace/ui/Spinner";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import React, { useMemo } from "react";
import { useRender } from "@/hooks/render";
import ManageInvoice from "@/components/Invoices/List/Manage";
import Stat from "@/components/Invoices/Stats/Stat";
import { IInvoice } from "@litespace/types";
import Error from "@/components/Invoices/Stats/Error";

const Stats: React.FC<{
  refreshAll: () => void;
  refresh: () => void;
  stats?: IInvoice.StatsApiResponse | null;
  loading: boolean;
  fetching: boolean;
  error: Error | null;
}> = ({ refresh, refreshAll, stats, loading, fetching, error }) => {
  const intl = useFormatMessage();
  const create = useRender();

  const data = useMemo((): Array<{
    id: LocalId;
    value: number;
  }> => {
    if (!stats) return [];
    return [
      {
        id: "invoices.stats.total.earnings",
        value: stats.income.past,
      },
      {
        id: "invoices.stats.spendable",
        value: stats.spendable,
      },
      {
        id: "invoices.stats.pending",
        value: stats.invoices.pending,
      },
      {
        id: "invoices.stats.withdrawn",
        value: stats.invoices.fulfilled,
      },
    ];
  }, [stats]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex flex-row items-center gap-2">
          <h3 className="text-3xl">{intl("invoices.stats.title")}</h3>
          {fetching && !loading ? <Spinner /> : null}
        </div>

        <Button onClick={create.show} size={"small"}>
          {intl("invoices.stats.create.invoice")}
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-[20vh]">
          <Spinner />
        </div>
      ) : null}

      {error ? (
        <Error
          refetch={refresh}
          disabled={loading || fetching}
          loading={loading || fetching}
        />
      ) : null}

      {data ? (
        <div className="grid grid-cols-12 gap-4">
          {data.map(({ id, value }) => (
            <div key={id} className="col-span-12 md:col-span-6 lg:col-span-4">
              <Stat id={id} value={value} />
            </div>
          ))}
        </div>
      ) : null}

      <ManageInvoice
        open={create.open}
        close={create.hide}
        refresh={refreshAll}
      />
    </div>
  );
};

export default Stats;
