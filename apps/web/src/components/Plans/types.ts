export type Tab = "monthly" | "quarter" | "half" | "annual";

export type PlanProps = {
  id: number;
  weeklyMinutes: number;
  price: number;
  discount?: number;
  label?: "most-common" | "most-valuable";
  primary?: boolean;
};

export type PlansDataProps = {
  monthly: PlanProps[];
  quarter: PlanProps[];
  half: PlanProps[];
  annual: PlanProps[];
};
