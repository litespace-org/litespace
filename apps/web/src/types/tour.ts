import { Void } from "@litespace/types";
import { LocalId } from "@litespace/ui/locales";
import { ReactNode } from "react";

export type TourId = `tour-${string}-${number}`;

export type TourStep<T extends string> = {
  id: TourId;
  info: {
    title: T;
    description?: T;
  };
  next?: Void;
  prev?: Void;
  skip?: boolean;
};

export type TourConfig = {
  nextButton?: ReactNode;
  prevButton?: ReactNode;
  onStop?: Void;
  onNext?: Void;
  onPrev?: Void;
};

export interface Tour<T extends string = string> {
  readonly config: TourConfig;
  readonly steps: Array<TourStep<T>>;
  setSteps(steps: Array<TourStep<T>>): void;
  addSteps(steps: Array<TourStep<T>>): void;
  setGoNext(goNext: Void): void;
  goNext(): void;
}

export type LocalTour = Tour<LocalId>;
