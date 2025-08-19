import { getDriver, getTourIds } from "@/lib/tour";
import { LocalTour, Tour, TourConfig } from "@/types/tour";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { useMemo } from "react";

export function useTour(localTour: LocalTour, config?: TourConfig) {
  const intl = useFormatMessage();

  const tour: Tour = localTour.map((step) => ({
    id: step.id,
    info: {
      title: intl(step.info.title),
      description: step.info.description
        ? intl(step.info.description)
        : undefined,
    },
  }));

  const driver = useMemo(() => getDriver(tour, config), [tour]);

  return {
    start: driver.drive,
    stop: driver.destroy,
    stepIds: getTourIds(tour),
  };
}
