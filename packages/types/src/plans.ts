export type Tab = "monthly" | "quarter" | "half" | "annual";

export type PlanCardProps = {
  /**
   * the title of the plan wheather
   *  - beginner
   *  - advanced
   *  - professional
   */
  title: string;
  /**
   * sammary about the plan
   */
  description: string;
  /**
   * number of minutes per week
   */
  weeklyMinutes: number;
  /**
   * price in egp (unscale)
   */
  price: number;
  label?: "most-common" | "most-valuable";
  primary?: boolean;
  /**
   * floating number between 0 and 100.
   */
  discount?: number;
};

export type PlanProps = {
  id: number;
  weeklyMinutes: number;
  price: number;
  label?: "most-common" | "most-valuable";
  primary?: boolean;
  discount?: number;
};

export type PlansDataProps = {
  monthly: PlanProps[];
  quarter: PlanProps[];
  half: PlanProps[];
  annual: PlanProps[];
};
