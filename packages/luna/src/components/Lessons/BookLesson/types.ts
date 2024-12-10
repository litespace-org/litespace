export type Step =
  | "date-selection"
  | "duration-selection"
  | "time-selection"
  | "confirmation";

export type AttributedSlot = {
  ruleId: number;
  /**
   * ISO UTC datetime
   */
  start: string;
  /**
   * ISO UTC datetime
   */
  end: string;
  bookable: boolean;
};
