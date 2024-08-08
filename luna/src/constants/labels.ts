import { range } from "lodash";

export enum ReportCategory {
  Lesson = "lesson",
  Subscription = "subscription",
}

export const categoryOptions = [
  {
    label: "Lesson problem",
    value: ReportCategory.Lesson,
  },
  {
    label: "Subscription problem",
    value: ReportCategory.Subscription,
  },
];

const year = new Date().getFullYear();

export const years = range(year, year - 70).map((year) => ({
  label: year.toString(),
  value: year.toString(),
}));
