import { range } from "lodash";
import ar from "@/locales/ar-eg.json";

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

export const days = [
  ar["global.days.sat"],
  ar["global.days.sun"],
  ar["global.days.mon"],
  ar["global.days.tue"],
  ar["global.days.wed"],
  ar["global.days.thu"],
  ar["global.days.fri"],
] as const;

export const months = [
  ar["global.months.january"],
  ar["global.months.february"],
  ar["global.months.march"],
  ar["global.months.april"],
  ar["global.months.may"],
  ar["global.months.june"],
  ar["global.months.july"],
  ar["global.months.august"],
  ar["global.months.september"],
  ar["global.months.october"],
  ar["global.months.november"],
  ar["global.months.december"],
] as const;
