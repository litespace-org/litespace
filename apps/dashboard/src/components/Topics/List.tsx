import { ITopic } from "@litespace/types";
import { UseQueryResult } from "@tanstack/react-query";
import { createColumnHelper } from "@tanstack/react-table";
import { useMemo } from "react";
import DateField from "../common/DateField";
import Error from "../common/Error";
import { Loading } from "@litespace/luna/Loading";
import { useFormatMessage } from "@litespace/luna/hooks/intl";
import { Table } from "../common/Table";

const List = ({
  query,
}: {
  query: UseQueryResult<ITopic.FindTopicsApiResponse, Error>;
}) => {
  const intl = useFormatMessage();

  const columnHelper =
    createColumnHelper<ITopic.FindTopicsApiResponse["list"]>();

  const columns = useMemo(
    () => [
      columnHelper.accessor("id", {
        header: "ID",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("name.ar", {
        header: "Name",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("name.en", {
        header: "Name",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("createdAt", {
        header: "Created At",
        cell: (info) => {
          return <DateField date={info.getValue()} />;
        },
      }),
      columnHelper.accessor("updatedAt", {
        header: "Updated At",
        cell: (info) => {
          return <DateField date={info.getValue()} />;
        },
      }),
    ],
    [columnHelper]
  );

  if (query.isLoading) return <Loading className="h-1/4" />;
  if (query.error)
    return (
      <Error
        error={query.error}
        title={intl("dashboard.error.alert.title")}
        refetch={query.refetch}
      />
    );
  if (!query.data) return null;

  return (
    <div>
      <Table
        columns={columns}
        data={query.data}
        goto={() => {}}
        prev={() => {}}
        next={() => {}}
        totalPages={query.data.total}
        fetching={false}
        loading={false}
        page={1}
      />
    </div>
  );
};

export default List;
