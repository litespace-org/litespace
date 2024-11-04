import List from "@/components/Invoices/List";
import Error from "@/components/common/Error";
import PageTitle from "@/components/common/PageTitle";
import { useFindInvoices } from "@litespace/headless/invoices";
import { Loading } from "@litespace/luna/Loading";
import { useFormatMessage } from "@litespace/luna/hooks/intl";
import React from "react";

const Invoices: React.FC = () => {
  const intl = useFormatMessage();
  const { query, ...pagination } = useFindInvoices();

  if (query.error) {
    return (
      <Error
        error={query.error}
        title={intl("dashboard.error.alert.title")}
        refetch={query.refetch}
      />
    );
  }

  return (
    <div className="w-full p-8 mx-auto max-w-screen-2xl">
      <header className="flex items-center justify-between mb-3">
        <PageTitle
          title={intl("invoices.title")}
          fetching={query.isFetching && !query.isLoading}
          count={query.data?.total}
        />
      </header>

      <div className="w-full">
        {query.isLoading ? (
          <Loading className="h-screen" show={query.isLoading} />
        ) : query.data ? (
          <List data={query.data} query={query} {...pagination} />
        ) : null}
      </div>
    </div>
  );
};

export default Invoices;
