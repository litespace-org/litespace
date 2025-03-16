import { Element, ITopic, Void } from "@litespace/types";
import { createColumnHelper } from "@tanstack/react-table";
import { useCallback, useMemo, useState } from "react";
import DateField from "@/components/Common/DateField";
import Error from "@/components/Common/Error";
import { Loading } from "@litespace/ui/Loading";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Table } from "@/components/Common/Table";
import { Menu } from "@litespace/ui/Menu";
import DeleteTopic from "@/components/Topics/DeleteTopic";
import TopicDialog from "@/components/Topics/TopicDialog";
import { UseQueryResult } from "@tanstack/react-query";
import Edit from "@litespace/assets/Edit";
import Trash from "@litespace/assets/Trash";

type Topics = ITopic.FindTopicsApiResponse["list"];
type Topic = Element<Topics>;

const List: React.FC<{
  query: UseQueryResult<ITopic.FindTopicsApiResponse, Error>;
  goto: (page: number) => void;
  next: Void;
  prev: Void;
  totalPages: number;
  page: number;
}> = ({ query, ...props }) => {
  const intl = useFormatMessage();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [action, setAction] = useState<"edit" | "delete" | null>(null);

  const refetch = useCallback(() => {
    query.refetch();
  }, [query]);

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
            <Menu
              actions={[
                {
                  icon: <Edit />,
                  label: intl("dashboard.topics.edit"),
                  onClick() {
                    setAction("edit");
                    setTopic(row.original);
                  },
                },
                {
                  icon: <Trash />,
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
        data={query.data.list}
        loading={query.isLoading}
        fetching={query.isFetching}
        {...props}
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
