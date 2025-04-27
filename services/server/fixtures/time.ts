import dayjs from "@/lib/dayjs";

const now = dayjs().utc();

export function month(months: number) {
  return now.add(months, "months");
}

export function isomonth(months: number) {
  return month(months).toISOString();
}

export function week(weeks: number) {
  return now.add(weeks, "weeks");
}

export function isoweek(weeks: number) {
  return week(weeks).toISOString();
}

export function hour(hours: number) {
  return now.add(hours, "hours");
}

export function isohour(hours: number) {
  return hour(hours).toISOString();
}

export function min(minutes: number) {
  return now.add(minutes, "minutes");
}

export function isomin(minutes: number) {
  return min(minutes).toISOString();
}

export default {
  month,
  isomonth,
  week,
  isoweek,
  hour,
  isohour,
  min,
  isomin,
  now,
};
