import { useMemo } from "react";
import { useFormatMessage } from "@litespace/luna/hooks/intl";
import { createColumnHelper } from "@tanstack/react-table";
import { ILesson, Void } from "@litespace/types";
import { Table } from "@/components/common/Table";
import { UseQueryResult } from "@tanstack/react-query";
import { Check, User } from "react-feather";
import { Link } from "react-router-dom";
import { asFullAssetUrl } from "@litespace/luna/backend";
import { formatCurrency } from "@litespace/luna/utils";
import { Duration } from "@litespace/sol/duration";
import { asIsoDate } from "@litespace/sol/dayjs";

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
    const currentTime = new Date();

    return [
      columnHelper.accessor("lesson.id", {
        header: intl("global.labels.id"),
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("lesson.price", {
        header: intl("dashboard.lessons.price"),
        cell: (info) => formatCurrency(info.getValue()),
      }),
      columnHelper.accessor((row) => row.members, {
        header: intl("dashboard.lessons.members.name"),
        cell: (info) => {
          const members = info.getValue();
          return (
            <div className="grid gap-1">
              {members.map((member, index) => (
                <Link
                  to={`/user/${member.userId}`}
                  key={index}
                  className="flex items-center gap-1 p-2 duration-300 rounded-md whitespace-nowrap hover:bg-gray-400/50"
                >
                  {member.image ? (
                    <img
                      src={asFullAssetUrl(member.image)}
                      className="w-6 h-6 rounded-full "
                    />
                  ) : (
                    <User className="w-6 h-6" />
                  )}
                  {member.name}
                </Link>
              ))}
            </div>
          );
        },
      }),
      columnHelper.accessor((row) => row.members, {
        header: intl("dashboard.lessons.members.host"),
        cell: (info) => {
          const members = info.getValue();
          return (
            <div className="grid">
              {members.map((member, index) => (
                <div
                  key={index}
                  className="flex justify-center text-2xl text-center"
                >
                  {member.host ? (
                    <Check className="w-8 h-8 text-green-600" />
                  ) : (
                    "-"
                  )}
                </div>
              ))}
            </div>
          );
        },
      }),
      columnHelper.accessor("call.duration", {
        header: intl("dashboard.lessons.call.duration"),
        cell: (info) => Duration.from(`${info.getValue()}min`).format("ar"),
      }),
      columnHelper.accessor("call.start", {
        header: intl("dashboard.lessons.call.start"),
        cell: (info) => (
          <div className="whitespace-nowrap">{asIsoDate(info.getValue())}</div>
        ),
      }),
      columnHelper.accessor((row) => row, {
        header: intl("dashboard.lessons.call.timeline-status"),
        cell: (info) => {
          const row = info.getValue();
          const callStartDate = new Date(row.call.start);
          const callEndDate = new Date(
            new Date(row.call.start).getTime() + row.call.duration * 60 * 1000
          );
          if (currentTime < callStartDate) {
            return intl("dashboard.lessons.call.timeline-status.future");
          } else if (currentTime > callEndDate) {
            return intl("dashboard.lessons.call.timeline-status.past");
          } else {
            return intl("dashboard.lessons.call.timeline-status.now");
          }
        },
      }),
      columnHelper.accessor((row) => row, {
        header: intl("dashboard.lessons.call.status"),
        cell: (info) => {
          const row = info.getValue();
          const cancellationDate = row.call.canceledAt;
          const callDate = new Date(row.call.start);
          if (cancellationDate)
            return intl("dashboard.lessons.call.status.cancelled");
          if (callDate < currentTime) {
            return intl("dashboard.lessons.call.status.fullfilled");
          } else {
            return intl("dashboard.lessons.call.status.pending");
          }
        },
      }),
    ];
  }, [columnHelper, intl]);

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
