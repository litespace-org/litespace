import List from "@/components/Invoices/List";
import Error from "@/components/common/Error";
import { useFindInvoices } from "@litespace/headless/invoices";
import { Loading } from "@litespace/luna/Loading";
import { useFormatMessage } from "@litespace/luna/hooks/intl";
import React from "react";

const Invoices: React.FC = () => {
  const intl = useFormatMessage();
  const { query, next, prev, goto, page, totalPages } = useFindInvoices();

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
      <div className="mb-4">
        <h1 className="text-3xl">{intl("invoices.title")}</h1>
      </div>
      <div className="w-full">
        {query.isLoading ? (
          <Loading className="h-screen" show={query.isLoading} />
        ) : query.data ? (
          <List
            invoicesList={query.data}
            query={query}
            next={next}
            prev={prev}
            goto={goto}
            page={page}
            totalPages={totalPages}
          />
        ) : null}
      </div>
    </div>
  );
};

export default Invoices;
