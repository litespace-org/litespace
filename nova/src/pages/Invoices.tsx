import List from "@/components/Invoices/List";
import Stats from "@/components/Invoices/Stats";
import { atlas } from "@/lib/atlas";
import { useAppSelector } from "@/redux/store";
import { profileSelector } from "@/redux/user/me";
import { usePaginationQuery } from "@litespace/luna";
import { IInvoice, Paginated } from "@litespace/types";
import { useQuery } from "@tanstack/react-query";
import React, { useCallback } from "react";

const Invoices: React.FC = () => {
  const profile = useAppSelector(profileSelector);
  const findInvoices = useCallback(
    async ({
      pageParam,
    }: {
      pageParam: number;
    }): Promise<Paginated<IInvoice.Self>> => {
      if (!profile) return { list: [], total: 0 };
      return await atlas.invoice.find({
        userId: profile.id,
        page: pageParam,
        size: 10,
      });
    },
    [profile]
  );

  const invoices = usePaginationQuery(findInvoices, ["invoices"]);

  const findStats = useCallback(async () => {
    if (!profile) return null;
    return await atlas.invoice.stats(profile.id);
  }, [profile]);

  const stats = useQuery({
    queryFn: findStats,
    queryKey: ["tutor-invoice-stats"],
    enabled: !!profile,
  });

  const refresh = useCallback(() => {
    invoices.query.refetch();
    stats.refetch();
  }, [invoices.query, stats]);

  return (
    <div className="max-w-screen-2xl mx-auto w-full p-6 flex flex-col gap-6">
      <Stats
        refresh={refresh}
        stats={stats.data}
        loading={stats.isLoading}
        fetching={stats.isFetching}
      />
      <List
        list={invoices.list}
        loading={invoices.query.isLoading}
        fetching={invoices.query.isFetching}
        withMore={invoices.query.hasNextPage}
        more={invoices.more}
        refresh={refresh}
      />
    </div>
  );
};

export default Invoices;
