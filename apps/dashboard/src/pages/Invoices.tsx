import List from "@/components/Invoices/List";
import {
  Button,
  ButtonSize,
  Loading,
  useFormatMessage,
  usePaginationQuery,
  atlas,
} from "@litespace/luna";
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
    <div className="w-full max-w-screen-2xl mx-auto p-8">
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
