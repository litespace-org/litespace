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
