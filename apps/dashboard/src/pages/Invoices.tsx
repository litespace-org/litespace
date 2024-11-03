import List from "@/components/Invoices/List";
import { Button, ButtonSize } from "@litespace/luna/Button";
import { Loading } from "@litespace/luna/Loading";
import { atlas } from "@litespace/luna/backend";
import { usePaginationQuery } from "@litespace/luna/hooks/common";
import { useFormatMessage } from "@litespace/luna/hooks/intl";
import { isEmpty } from "lodash";
import React, { useCallback } from "react";

const Invoices: React.FC = () => {
  const intl = useFormatMessage();
  const findInvoices = useCallback(
    async ({ pageParam }: { pageParam: number }) => {
      return await atlas.invoice.find({ page: pageParam });
    },
    []
  );

  const { list, query, more } = usePaginationQuery(findInvoices, [
    "find-invoices",
  ]);

  const onUpdate = useCallback(() => {
    query.refetch();
  }, [query]);

  return (
    <div className="w-full p-8 mx-auto max-w-screen-2xl">
      <div className="mb-4">
        <h1 className="text-3xl">{intl("invoices.title")}</h1>
      </div>

      <Loading className="h-screen" show={query.isLoading} />
      {list && !isEmpty(list) ? (
        <div className="w-full">
          <List invoices={list} onUpdate={onUpdate} />
          <Button
            size={ButtonSize.Small}
            onClick={more}
            loading={query.isLoading || query.isFetching}
            disabled={query.isLoading || query.isFetching || !query.hasNextPage}
          >
            {intl("global.labels.more")}
          </Button>
        </div>
      ) : null}
    </div>
  );
};

export default Invoices;
