import { useMemo } from "react";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { createColumnHelper } from "@tanstack/react-table";
import { ILesson, Void } from "@litespace/types";
import { Table } from "@/components/common/Table";
import { UseQueryResult } from "@tanstack/react-query";
import { formatCurrency } from "@litespace/ui/utils";
import { Duration } from "@litespace/utils/duration";
import { Loading } from "@litespace/ui/Loading";
import Error from "@/components/common/Error";
import { price } from "@litespace/utils/value";
import UserPopover from "@/components/common/UserPopover";
import DateField from "@/components/common/DateField";
import { dayjs } from "@/lib/dayjs";

const List: React.FC<{
  query: UseQueryResult<ILesson.FindUserLessonsApiResponse, Error>;
  next: Void;
  prev: Void;
  goto: (pageNumber: number) => void;
  page: number;
  totalPages: number;
}> = ({ query, next, prev, goto, page, totalPages }) => {
  const intl = useFormatMessage();

  const columnHelper =
    createColumnHelper<ILesson.FindUserLessonsApiResponse["list"][number]>();

  const columns = useMemo(() => {
    return [
      columnHelper.accessor("lesson.id", {
        header: intl("global.labels.id"),
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor((row) => row.members, {
        header: intl("dashboard.lessons.members"),
        cell: (info) => {
          const members = info.getValue();
          return (
            <div className="flex flex-row items-start justify-start gap-2">
              {members.map((member) => (
                <UserPopover id={member.userId} key={member.userId} />
              ))}
            </div>
          );
        },
      }),
      columnHelper.accessor("lesson.price", {
        header: intl("dashboard.lessons.price"),
        cell: (info) => formatCurrency(price.unscale(info.getValue())),
      }),
      columnHelper.accessor("lesson.duration", {
        header: intl("dashboard.lessons.duration"),
        cell: (info) => Duration.from(info.getValue().toString()).format("ar"),
      }),
      columnHelper.accessor("lesson.start", {
        header: intl("dashboard.lessons.start"),
        cell: (info) => <DateField date={info.getValue()} />,
      }),
      columnHelper.display({
        header: intl("dashboard.lessons.status"),
        cell: (info) => {
          const canceledAt = info.row.original.lesson.canceledAt;
          const canceledBy = info.row.original.lesson.canceledBy;

          if (canceledAt && canceledBy)
            return (
              <div className="flex flex-col items-start gap-1">
                <p>{intl("dashboard.lessons.status.cancelled")}</p>
                <UserPopover id={canceledBy} />
              </div>
            );

          const start = dayjs(info.row.original.lesson.start);
          const end = start.add(info.row.original.lesson.duration, "minutes");
          const now = dayjs();

          const happening = now.isBetween(start, end, "minutes", "[]");
          if (happening) return intl("dashboard.lessons.status.happening");

          const pending = start.isAfter(dayjs());
          if (pending) return intl("dashboard.lessons.status.pending");

          const fullfilled = start.isBefore(dayjs());
          if (fullfilled) return intl("dashboard.lessons.status.fulfilled");

          return "-";
        },
      }),
      columnHelper.accessor("lesson.createdAt", {
        header: intl("global.created-at"),
        cell: (info) => <DateField date={info.getValue()} />,
      }),
      columnHelper.accessor("lesson.updatedAt", {
        header: intl("global.updated-at"),
        cell: (info) => <DateField date={info.getValue()} />,
      }),
    ];
  }, [columnHelper, intl]);

  if (query.isLoading) return <Loading className="h-1/4" />;
  if (query.error)
    return (
      <Error
        title={intl("dashboard.error.alert.title")}
        error={query.error}
        refetch={query.refetch}
      />
    );

  if (!query.data) return null;

  return (
    <div>
      <Table
        columns={columns}
        data={query.data.list}
        goto={goto}
        prev={prev}
        next={next}
        fetching={query.isFetching}
        loading={query.isLoading}
        totalPages={totalPages}
        page={page}
      />
    </div>
  );
};
export default List;
