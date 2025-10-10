import { ISessionEvent } from "@litespace/types";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import dayjs from "@/lib/dayjs";
import DateTimeField from "@/components/Common/DateTimeField";
import { createColumnHelper } from "@tanstack/react-table";
import { useCallback, useMemo } from "react";
import { Table } from "@litespace/ui/Table";

interface EventsTableProps {
  title: string;
  events: ISessionEvent.MetaSelf[];
}

const EventsTable: React.FC<EventsTableProps> = ({ title, events }) => {
  const intl = useFormatMessage();

  const getEventType = useCallback(
    (type: number) => {
      if (type === 1) return intl("dashboard.lesson-events.joined");
      if (type === 2) return intl("dashboard.lesson-events.left");
      return intl("dashboard.lesson-events.unknown");
    },
    [intl]
  );

  const columnHelper = createColumnHelper<ISessionEvent.MetaSelf>();

  const columns = useMemo(
    () => [
      columnHelper.accessor("type", {
        header: intl("global.labels.type"),
        cell: (info) => (
          <span
            className={`px-2 py-1 rounded ${
              info.getValue() === 1
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {getEventType(info.getValue())}
          </span>
        ),
      }),
      columnHelper.accessor("createdAt", {
        header: intl("global.labels.time"),
        cell: (info) => (
          <div className="flex flex-col">
            <DateTimeField date={info.getValue()} />
            <span className="text-xs text-gray-500">
              ({dayjs(info.getValue()).fromNow()})
            </span>
          </div>
        ),
      }),
      columnHelper.accessor("createdAt", {
        id: "timeRelativeToSession",
        header: intl("dashboard.lesson-events.time-relative-to-session"),
        cell: (info) => {
          const eventTime = dayjs(info.getValue());
          const sessionStart = dayjs(info.row.original.sessionStart);
          const minutesDiff = eventTime.diff(sessionStart, "minutes");

          const sign = minutesDiff === 0 ? "" : minutesDiff > 0 ? "+" : "";
          const formattedValue = `${sign}${Math.abs(minutesDiff)}`;

          const textColor =
            minutesDiff < 0
              ? "text-blue-600"
              : minutesDiff === 0
                ? "text-gray-500"
                : "text-green-600";

          return (
            <div className={`font-medium ${textColor}`}>
              {formattedValue} {intl("global.labels.minutes")}
              <div className="text-xs text-gray-500 mt-1">
                {minutesDiff < 0
                  ? intl("dashboard.lesson-events.before-session")
                  : minutesDiff > 0
                    ? intl("dashboard.lesson-events.after-session")
                    : intl("dashboard.lesson-events.at-session")}
              </div>
            </div>
          );
        },
      }),
    ],
    [columnHelper, getEventType, intl]
  );

  if (events.length === 0) {
    return (
      <div className="rounded-lg shadow p-6 mb-6">
        <h3 className="text-lg font-semibold mb-3">
          {intl("dashboard.lesson-events.events")} {title}
        </h3>
        <p className="text-gray-500 text-center">
          {intl("dashboard.lesson-events.no-events")}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg shadow overflow-hidden mb-6">
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold">
          {intl("dashboard.lesson-events.events")} {title}
        </h3>
      </div>
      <Table columns={columns} data={events} fetching={false} loading={false} />
    </div>
  );
};

export default EventsTable;
