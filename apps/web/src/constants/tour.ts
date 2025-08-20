import { Tour, TourConfig, TourId, TourStep } from "@/types/tour";
import { Void } from "@litespace/types";
import { LocalId } from "@litespace/ui/locales";

export class GeneralTour<T extends string> implements Tour<T> {
  readonly config: TourConfig = {};
  readonly steps: Array<TourStep<T>> = [];

  private goNextFn: Void = () => {};

  constructor(config?: TourConfig, steps?: Array<TourStep<T>>) {
    this.config = config || {};
    if (steps) this.steps.push(...steps);
    return this;
  }

  setSteps(steps: Array<TourStep<T>>) {
    while (this.steps.length > 0) this.steps.pop();
    this.steps.push(...steps);
  }

  addSteps(steps: Array<TourStep<T>>) {
    this.steps.push(...steps);
  }

  stepId(index: number, stepOverride?: Partial<TourStep<T>>): TourId {
    const step = this.steps[index];
    if (stepOverride?.info?.title) step.info.title = stepOverride.info.title;
    if (stepOverride?.info?.description)
      step.info.description = stepOverride.info.description;
    if (stepOverride?.skip) step.skip = stepOverride.skip;
    if (stepOverride?.next) step.next = stepOverride.next;
    if (stepOverride?.prev) step.next = stepOverride.prev;
    return step.id;
  }

  goNext(): void {
    this.goNextFn();
  }

  setGoNext(goNext: Void): void {
    this.goNextFn = goNext;
  }
}

export const StudentDashboardTour = new GeneralTour<LocalId>({});

StudentDashboardTour.addSteps([
  {
    id: "tour-sdashboard-1",
    info: {
      title: "tour.sdashboard/1.title",
      description: "tour.sdashboard/1.description",
    },
  },
  {
    id: "tour-sdashboard-2",
    info: {
      title: "tour.sdashboard/2.title",
      description: "tour.sdashboard/2.description",
    },
  },
  /*
  {
    id: "tour-sdashboard-3",
    info: {
      title: "tour.sdashboard/3.title",
      description: "tour.sdashboard/3.description",
    },
  },
  */
  {
    id: "tour-sdashboard-4",
    info: {
      title: "tour.sdashboard/4.title",
      description: "tour.sdashboard/4.description",
    },
  },
  {
    id: "tour-sdashboard-5",
    info: {
      title: "tour.sdashboard/5.title",
      description: "tour.sdashboard/5.description",
    },
  },
]);
