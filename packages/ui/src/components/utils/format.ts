import {
  DAYS_IN_WEEK,
  HOURS_IN_DAY,
  MILLISECONDS_IN_SECOND,
  MINUTES_IN_HOUR,
  percentage,
  SECONDS_IN_MINUTE,
} from "@litespace/utils";
import humanize, { Options } from "humanize-duration";

export function formatNumber(
  value: number,
  options?: Intl.NumberFormatOptions
) {
  return new Intl.NumberFormat("en", options).format(value);
}

/**
 * @param value floating number
 * @note numbers between 0 and 100 are mapped to 0% and 100%
 * @returns
 */
export function formatPercentage(
  value: number,
  options?: Intl.NumberFormatOptions
): string {
  return new Intl.NumberFormat("en", {
    style: "percent",
    maximumFractionDigits: 2,
    ...options,
  }).format(percentage.unscale(value));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency: "EGP",
    maximumFractionDigits: 2,
  }).format(value);
}

function humanizeAr(ms: number, options: Options = {}) {
  return humanize(ms, {
    language: "ar",
    digitReplacements: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
    ...options,
  });
}

export function formatDuration(ms: number, options: Options = {}): string {
  return humanizeAr(ms, options);
}

export function formatMinutes(value: number, options: Options = {}): string {
  return humanizeAr(
    value * SECONDS_IN_MINUTE * MILLISECONDS_IN_SECOND,
    options
  );
}

export function formatWeeks(value: number, options: Options = {}): string {
  return humanizeAr(
    value *
      DAYS_IN_WEEK *
      HOURS_IN_DAY *
      MINUTES_IN_HOUR *
      SECONDS_IN_MINUTE *
      MILLISECONDS_IN_SECOND,
    {
      maxDecimalPoints: 0,
      units: ["w"],
      ...options,
    }
  );
}
