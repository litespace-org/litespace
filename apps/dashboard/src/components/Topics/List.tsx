import { Element, ITopic, Void } from "@litespace/types";
import { createColumnHelper } from "@tanstack/react-table";
import { useCallback, useMemo, useState } from "react";
import DateField from "@/components/common/DateField";
import Error from "@/components/common/Error";
import { Loading } from "@litespace/luna/Loading";
import { useFormatMessage } from "@litespace/luna/hooks/intl";
import { Table } from "@/components/common/Table";
import { UsePaginateResult } from "@/types/query";
import { ActionsMenu } from "@litespace/luna/ActionsMenu";
import DeleteTopic from "@/components/Topics/DeleteTopic";
import TopicDialog from "@/components/Topics/TopicDialog";

type Topics = ITopic.FindTopicsApiResponse["list"];
type IndividualTopic = ITopic.FindTopicsApiResponse["list"][number];

const List: React.FC<{
  query: UsePaginateResult<Element<Topics>>;
  goto: (page: number) => void;
  next: Void;
  prev: Void;
  totalPages: number;
  page: number;
}> = ({ query, ...props }) => {
  const intl = useFormatMessage();
  const [topic, setTopic] = useState<IndividualTopic | null>(null);
  const [action, setAction] = useState<"edit" | "delete" | null>(null);

  const refetch = useCallback(() => {
    query.query.refetch();
  }, [query.query]);

  const columnHelper = createColumnHelper<Element<Topics>>();

  const columns = useMemo(
    () => [
      columnHelper.accessor("id", {
        header: intl("global.labels.id"),
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("name.ar", {
        header: intl("dashboard.topics.name.ar"),
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("name.en", {
        header: intl("dashboard.topics.name.en"),
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("createdAt", {
        header: intl("global.created-at"),
        cell: (info) => {
          return <DateField date={info.getValue()} />;
        },
      }),
      columnHelper.accessor("updatedAt", {
        header: intl("global.updated-at"),
        cell: (info) => {
          return <DateField date={info.getValue()} />;
        },
      }),
      columnHelper.display({
        id: "actions",
        cell: ({ row }) => {
          return (
            <ActionsMenu
              actions={[
                {
                  id: 1,
                  label: intl("dashboard.topics.edit"),
                  onClick() {
                    setAction("edit");
                    setTopic(row.original);
                  },
                },
                {
                  id: 2,
                  label: intl("dashboard.topics.delete"),
                  onClick() {
                    setAction("delete");
                    setTopic(row.original);
                  },
                },
              ]}
            />
          );
        },
      }),
    ],
    [columnHelper, intl]
  );

  if (query.query.isLoading) return <Loading className="h-1/4" />;

  if (query.query.error)
    return (
      <Error
        error={query.query.error}
        title={intl("dashboard.error.alert.title")}
        refetch={query.query.refetch}
      />
    );

  if (!query.query.data) return null;

  return (
    <div>
      <Table
        columns={columns}
        data={query.query.data.list}
        {...props}
        loading={query.query.isLoading}
        fetching={query.query.isFetching}
      />
      {action === "edit" && topic ? (
        <TopicDialog
          topic={topic}
          onUpdate={refetch}
          open={!!topic}
          close={() => {
            setTopic(null);
            setAction(null);
          }}
        />
      ) : null}
      {action === "delete" && topic ? (
        <DeleteTopic
          topic={topic}
          onUpdate={refetch}
          close={() => {
            setTopic(null);
            setAction(null);
          }}
        />
      ) : null}
    </div>
  );
};

export default List;
