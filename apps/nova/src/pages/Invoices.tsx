import List from "@/components/Invoices/List";
import Stats from "@/components/Invoices/Stats";
import React, { useCallback } from "react";
import {
  useFindInvoiceStats,
  useFindInvoicesByUser,
} from "@litespace/headless/invoices";
import { useUser } from "@litespace/headless/context/user";

const Invoices: React.FC = () => {
  const { user } = useUser();
  const invoices = useFindInvoicesByUser({
    users: user ? [user.id] : undefined,
    userOnly: true,
  });
  const stats = useFindInvoiceStats(user?.id);

  const refresh = useCallback(() => {
    invoices.query.refetch();
    stats.refetch();
  }, [invoices.query, stats]);

  return (
    <div className="flex flex-col w-full gap-6 p-6 mx-auto max-w-screen-2xl">
      <Stats
        refreshAll={refresh}
        refresh={stats.refetch}
        stats={stats.data}
        loading={stats.isLoading}
        fetching={stats.isFetching}
        error={stats.error}
      />
      <List
        list={invoices.list}
        loading={invoices.query.isLoading}
        fetching={invoices.query.isFetching}
        withMore={invoices.query.hasNextPage}
        more={invoices.more}
        refresh={invoices.query.refetch}
        refreshAll={refresh}
        error={invoices.query.error}
      />
    </div>
  );
};

export default Invoices;
