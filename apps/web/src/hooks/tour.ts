import { GeneralTour } from "@/constants/tour";
import { getDriver } from "@/lib/tour";
import { LocalTour, Tour, TourConfig } from "@/types/tour";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { LocalId } from "@litespace/ui/locales";
import { useEffect, useMemo, useState } from "react";

export function useTour(localTour: LocalTour, config?: TourConfig) {
  const intl = useFormatMessage();
  const [tour, setTour] = useState<Tour>(localTour);
  const [started, setStarted] = useState<boolean>(false);

  useEffect(() => {
    const steps = localTour.steps;
    for (const step of steps) {
      if (!step.info) continue;

      step.info.title = intl(step.info.title) as LocalId;

      if (step.info.description)
        step.info.description = intl(step.info.description) as LocalId;
    }
    setTour(new GeneralTour(config, steps));
  }, [localTour, intl, config]);

  const driver = useMemo(() => {
    const driver = getDriver(tour, config);
    if (started) driver.drive();
    tour.setGoNext(driver.moveNext);
    return driver;
  }, [tour, started, config]);

  return {
    tour,
    start: () => {
      driver.drive();
      setStarted(true);
    },
    startFrom: (stepNumber: number) => {
      driver.drive();
      driver.moveTo(stepNumber);
      setStarted(true);
    },
    stop: driver.destroy,
    lastStep: !driver.hasNextStep(),
  };
}
