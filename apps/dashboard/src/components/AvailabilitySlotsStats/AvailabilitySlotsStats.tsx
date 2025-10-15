import { useGetAvailabilitySlotsStats } from "@litespace/headless/availabilitySlots";
import React, { useMemo } from "react";
import LabelsTable, { TableLablesRow } from "@/components/Common/LabelsTable";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import {
  formatMinutes as formatMinutesBase,
  formatPercentage as formatPercentageBase,
} from "@litespace/ui/utils";
import Title from "@/components/Common/Title";
import { percentage } from "@litespace/utils";

function formatMinutes(minutes: number) {
  return formatMinutesBase(minutes, {
    units: ["h", "m"],
  });
}

function formatPercentage(first: number, second: number) {
  if (second === 0) return "-%";
  return formatPercentageBase(percentage.scale(first / second));
}

export const AvailabilitySlotsStats: React.FC = () => {
  const stats = useGetAvailabilitySlotsStats();
  const intl = useFormatMessage();

  const rows = useMemo((): TableLablesRow[] => {
    if (!stats.data) return [];
    return [
      {
        label: intl(
          "dashboard.main.availability-stats.available-teaching-hours-of-yesterday"
        ),
        value: formatMinutes(stats.data.slotsSumOfYesterday),
      },
      {
        label: intl(
          "dashboard.main.availability-stats.available-teaching-hours-of-today"
        ),
        value: formatMinutes(stats.data.slotsSumOfToday),
      },
      {
        label: intl(
          "dashboard.main.availability-stats.available-teaching-hours-of-tomorrow"
        ),
        value: formatMinutes(stats.data.slotsSumOfTomorrow),
      },
      {
        label: intl(
          "dashboard.main.availability-stats.available-teaching-hours-of-next-week"
        ),
        value: formatMinutes(stats.data.slotsSumOfNextWeek),
      },
      {
        label: intl(
          "dashboard.main.availability-stats.utalized-teaching-hours-of-yesterday"
        ),
        value: (
          <div>
            {formatMinutes(stats.data.lessonsSumOfYesterday)} (
            {formatPercentage(
              stats.data.lessonsSumOfYesterday,
              stats.data.slotsSumOfYesterday
            )}
            )
          </div>
        ),
      },
      {
        label: intl(
          "dashboard.main.availability-stats.utalized-teaching-hours-of-today"
        ),
        value: (
          <div>
            {formatMinutes(stats.data.lessonsSumOfToday)} (
            {formatPercentage(
              stats.data.lessonsSumOfToday,
              stats.data.slotsSumOfToday
            )}
            )
          </div>
        ),
      },
      {
        label: intl(
          "dashboard.main.availability-stats.utalized-teaching-hours-of-tomorrow"
        ),
        value: (
          <div>
            {formatMinutes(stats.data.lessonsSumOfTomorrow)} (
            {formatPercentage(
              stats.data.lessonsSumOfTomorrow,
              stats.data.slotsSumOfTomorrow
            )}
            )
          </div>
        ),
      },
      {
        label: intl(
          "dashboard.main.availability-stats.utalized-teaching-hours-of-next-week"
        ),
        value: (
          <div>
            {formatMinutes(stats.data.lessonsSumOfNextWeek)} (
            {formatPercentage(
              stats.data.lessonsSumOfNextWeek,
              stats.data.slotsSumOfNextWeek
            )}
            )
          </div>
        ),
      },
    ];
  }, [intl, stats.data]);

  return (
    <div className="flex flex-col gap-3">
      <Title
        title={intl("dashboard.main.availability-stats.title")}
        fetching={stats.isFetching}
      />

      <LabelsTable rows={rows} />
    </div>
  );
};
