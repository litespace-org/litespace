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
};

export type LocalTour = Array<TourStep<LocalId>>;
export type Tour = Array<TourStep<string>>;

export type TourConfig = {
  nextButton?: ReactNode;
  prevButton?: ReactNode;
  onStop?: Void;
};
