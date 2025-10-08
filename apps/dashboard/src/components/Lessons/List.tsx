import { useMemo } from "react";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { createColumnHelper } from "@tanstack/react-table";
import { ILesson, Void } from "@litespace/types";
import { Table } from "@litespace/ui/Table";
import { UseQueryResult } from "@tanstack/react-query";
import { formatCurrency } from "@litespace/ui/utils";
import { Duration } from "@litespace/utils/duration";
import { price } from "@litespace/utils/value";
import UserPopover from "@/components/Common/UserPopover";
import DateField from "@/components/Common/DateField";
import { dayjs } from "@/lib/dayjs";
import { LoadingFragment } from "@/components/Common/LoadingFragment";

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
        header: intl("labels.id"),
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

  if (query.isLoading || query.error || !query.data)
    return (
      <LoadingFragment
        loading={
          query.isLoading
            ? { text: intl("dashboard.lessons.loading"), size: "large" }
            : undefined
        }
        error={
          query.error || !query.data
            ? { text: intl("dashboard.lessons.error"), size: "medium" }
            : undefined
        }
        refetch={query.refetch}
      />
    );

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
