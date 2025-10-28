import { IConfirmationCode, IPlan, IUser } from "@litespace/types";
import { percentage, price } from "@/value";

export const WEEKS_IN_YEAR = 52;
export const WEEKS_IN_MONTH = 4;
export const WEEKS_IN_QUARTER = 12;
export const MONTHS_IN_QUARTER = 3;
export const MONTHS_IN_YEAR = 12;
export const MINUTES_IN_HOUR = 60;
export const SECONDS_IN_MINUTE = 60;
export const MILLISECONDS_IN_SECOND = 1000;
export const HOURS_IN_DAY = 24;
export const MINUTES_IN_DAY = 60 * 24;
export const MINUTES_IN_WEEK = 60 * 24 * 7;
export const MIN_AGE = 10;
export const MAX_AGE = 70;
export const DAYS_IN_WEEK = 7;
export const DAYS_IN_MONTH = 30;
export const MIN_USER_NAME_LENGTH = 2;
export const MAX_USER_NAME_LENGTH = 30;
export const MIN_INTERVIEW_LEVEL = 1;
export const MAX_INTERVIEW_LEVEL = 5;
export const MAX_RATING_TEXT_LENGTH = 1000;
export const MIN_RATING_TEXT_LENGTH = 3;
export const MIN_RATING_VALUE = 1;
export const MAX_RATING_VALUE = 5;
export const MIN_DISCOUNT_VALUE = 0;
export const MAX_DISCOUNT_VALUE = 100;
export const BIO_REGEX = /[\u0600-\u06ff\s]{5,}/;
export const MIN_TUTOR_BIO_LEGNTH = 25;
export const MAX_TUTOR_BIO_LENGTH = 60;
export const MAX_TUTOR_ABOUT_TEXT_LENGTH = 1000;
export const MIN_TUTOR_ABOUT_TEXT_LENGTH = 50;
export const MIN_PASSWORD_LENGTH = 8;
export const MAX_PASSWORD_LENGTH = 100;
export const MAX_USER_AGE = 60;
export const MIN_USER_AGE = 10;
export const MIN_TUTOR_NOTICE_DURATION = 0;
export const MAX_TUTOR_NOTICE_DURATION = 24 * 60;
export const MAX_FEEDBACK_TEXT_LENGTH = 1000;
export const MIN_FEEDBACK_TEXT_LENGTH = 5;
export const MAX_NOTE_TEXT_LENGTH = 1000;
export const MIN_NOTE_TEXT_LENGTH = 5;
export const MIN_INVOICE_AMOUNT = 100;
export const MAX_INVOICE_AMOUNT = 50_000;

export const MIN_LESSON_DURATION = 45; // TODO: due to temporary policy change.
export const MAX_LESSON_DURATION = 45;
export const LESSON_DURATION_LIST = [MAX_LESSON_DURATION, MIN_LESSON_DURATION];

export const MIN_PLAN_WEEKLY_MINUTES = MIN_LESSON_DURATION;
export const MAX_PLAN_DISCOUNT_UNSCALED = 100;
export const MIN_PLAN_DISCOUNT_UNSCALED = 0;
export const MAX_PLAN_DISCOUNT_SCALED = percentage.scale(100);
export const MIN_PLAN_DISCOUNT_SCALED = percentage.scale(0);

export const MAX_MESSAGE_TEXT_LENGTH = 1000;
export const MIN_MESSAGE_TEXT_LENGTH = 1;
export const MAX_PLAN_WEEKLY_MINUTES = MINUTES_IN_WEEK;
export const NUMBERS_ONLY_REGEX = /\d/;
export const PASSWORD_REGEX = /^(?=.*[0-9])(?=.*[a-zA-Z])(?!.*\s).{8,50}$/;
export const PASSWORD_LETTERS_REGEX = /[\W\w][^\d]+/;
export const HTML_TAGS_REGEX = /<[^>]*>/g;
export const HTML_REGEX = /<([A-Za-z][A-Za-z0-9]*)\b[^>]*>(.*?)<\/\1>/;
export const COUPON_REGEX = /[a-zA-Z0-9!@#$%^&*()_+=-}{?.,]/;
export const EMAIL_REGEX = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
export const ARABIC_LETTERS_REGEX = /^[\u0600-\u06ff\s\d.]+$/;
export const PHONE_NUMBER_REGEX = /^01[0125]\d{8}$/;
export const INSTAPAY_REGEX = /^\w+@instapay$/;
export const ARABIC_LETTERS_ONLY_REGEX = /^[\u0600-\u06ff\s]+$/;
export const TOPIC_ARABIC_NAME_REGEX = /[\u0600-\u06ff\s]{3,50}/;
export const TOPIC_ENGLISH_NAME_REGEX = /[a-zA-Z\s]{3,50}/;
export const MIN_TOPIC_LEGNTH = 3;
export const MAX_TOPIC_LEGNTH = 50;
export const MAX_TOPICS_COUNT = 30;
export const MIN_CONTACT_REQUEST_TITLE_LENGTH = 5;
export const MAX_CONTACT_REQUEST_TITLE_LENGTH = 128;
export const MIN_CONTACT_REQUEST_MESSAGE_LENGTH = 10;
export const MAX_CONTACT_REQUEST_MESSAGE_LENGTH = 1000;
export const TELEGRAM_NUMBER = "010-2001-7777";
export const LITESPACE_NOTIFY_URL = "https://t.me/litespace_notify";
export const LITESPACE_TUTORS_TELEGRAM_GROUP_URL =
  "https://t.me/litespace_tutors";
export const MAIN_TUTOR_MANAGER_TELEGRAM_URL =
  "https://web.telegram.org/k/#@MahmoudNagaty";
export const VIDEO_SESSION_EXAMPLE =
  "https://litespace-prod-assets.fra1.cdn.digitaloceanspaces.com/4ea88b90-dc5b-4b31-9131-fa2da1475ce3";
export const LITESPACE_SUPPORT_URL = "https://wa.me/+201552873917";

// All users except tutors and tutor-managers can have their names in either Arabic or English or both.
// https://regex101.com/r/ER7McY/1
export const USER_NAME_REGEX = /^[A-Za-z\u0600-\u06ff ]+$/;

export const HAS_ENGLISH_CHAR_REGEX = /[a-zA-Z]+/;
export const HAS_ARABIC_CHAR_REGEX =
  /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]+/;

/**
 * Interview duration in minutes.
 */
export const INTERVIEW_DURATION = 30;
export const INTERVIEW_MIN_RETRY_PERIOD_IN_DAYS = 3 * DAYS_IN_MONTH;

export const DEMO_SESSION_DURATION = 30;

export const CONFIRMATION_CODE_DIGIT_COUNT = 5;
export const CONFIRMATION_CODE_VALIDITY_MINUTES = 15;

export const AFRICA_CAIRO_TIMEZONE = "Africa/Cairo";

export const NOTIFICATION_METHOD_TO_PURPOSE: Record<
  IUser.NotificationMethod,
  IConfirmationCode.Purpose
> = {
  [IUser.NotificationMethod.Whatsapp]: IConfirmationCode.Purpose.VerifyWhatsApp,
};

export const NOTIFICATION_METHOD_LITERAL_TO_ENUM: Record<
  IUser.NotificationMethodLiteral,
  IUser.NotificationMethod
> = {
  whatsapp: IUser.NotificationMethod.Whatsapp,
};

export const NOTIFICATION_METHOD_LITERAL_TO_PURPOSE: Record<
  IUser.NotificationMethodLiteral,
  IConfirmationCode.Purpose
> = {
  whatsapp: IConfirmationCode.Purpose.VerifyWhatsApp,
};

export const NOTIFICATION_METHOD_TO_NOTIFICATION_METHOD_LITERAL: Record<
  IUser.NotificationMethod,
  IUser.NotificationMethodLiteral
> = {
  [IUser.NotificationMethod.Whatsapp]: "whatsapp",
};

export const PLAN_PERIOD_TO_PLAN_PERIOD_LITERAL: Record<
  IPlan.Period,
  IPlan.PeriodLiteral
> = {
  [IPlan.Period.Month]: "month",
  [IPlan.Period.Quarter]: "quarter",
  [IPlan.Period.Year]: "year",
  [IPlan.Period.FreeTrial]: "free-trial",
};

export const PLAN_PERIOD_LITERAL_TO_PLAN_PERIOD: Record<
  IPlan.PeriodLiteral,
  IPlan.Period
> = {
  month: IPlan.Period.Month,
  quarter: IPlan.Period.Quarter,
  year: IPlan.Period.Year,
  "free-trial": IPlan.Period.FreeTrial,
};

export const PLAN_PERIOD_TO_MONTH_COUNT: Record<IPlan.Period, number> = {
  [IPlan.Period.Month]: 1,
  [IPlan.Period.Quarter]: 3,
  [IPlan.Period.Year]: 12,
  [IPlan.Period.FreeTrial]: 1200,
};

export const PLAN_PERIOD_LITERAL_TO_MONTH_COUNT: Record<
  IPlan.PeriodLiteral,
  number
> = {
  month: 1,
  quarter: 3,
  year: 12,
  "free-trial": 1200,
};

export const PLAN_PERIOD_LITERAL_TO_WEEK_COUNT: Record<
  IPlan.PeriodLiteral,
  number
> = {
  month: 4,
  quarter: 12,
  year: 52,
  "free-trial": 5200,
};

export const PLAN_PERIOD_TO_WEEK_COUNT: Record<IPlan.Period, number> = {
  [IPlan.Period.Month]: 4,
  [IPlan.Period.Quarter]: 12,
  [IPlan.Period.Year]: 52,
  [IPlan.Period.FreeTrial]: 5200,
};

export const INTRO_VIDEO_EXPIRY_MONTHS = 3;
export const STUDENT_FREE_WEEKLY_MINUTES = 60;
export const MAX_PAID_LESSON_COUNT = 2;
export const TOTAL_LESSON_HOURLY_RATE = price.scale(255);

/**
 * The maximum number of hours, before lessons start time,
 * that makes any lesson uncancellable.
 */
export const UNCANCELLABLE_LESSON_HOURS = 6;

export const TIME_PERIODS: Record<
  IUser.TimePeriod,
  { start: string; end: string }
> = {
  [IUser.TimePeriod.Morning]: { start: "06:00", end: "11:59" },
  [IUser.TimePeriod.Noon]: { start: "12:00", end: "15:59" },
  [IUser.TimePeriod.Afternoon]: { start: "16:00", end: "18:59" },
  [IUser.TimePeriod.Evening]: { start: "19:00", end: "23:59" },
  [IUser.TimePeriod.Night]: { start: "00:00", end: "05:59" },
};

// src/constants/regionMap.ts
export interface RegionInfo {
  code: string; // ISO-2
  name: string; // English name
  dialCode: string; // e.g. "+20"
  flag: string; // Emoji
  rtl?: boolean; // Right-to-left language
}

export const REGION_MAP: Record<string, RegionInfo> = {
  AD: { code: "AD", name: "Andorra", dialCode: "+376", flag: "AD" },
  AE: {
    code: "AE",
    name: "United Arab Emirates",
    dialCode: "+971",
    flag: "AE",
    rtl: true,
  },
  AF: {
    code: "AF",
    name: "Afghanistan",
    dialCode: "+93",
    flag: "AF",
    rtl: true,
  },
  AG: { code: "AG", name: "Antigua and Barbuda", dialCode: "+1", flag: "AG" },
  AI: { code: "AI", name: "Anguilla", dialCode: "+1", flag: "AI" },
  AL: { code: "AL", name: "Albania", dialCode: "+355", flag: "AL" },
  AM: { code: "AM", name: "Armenia", dialCode: "+374", flag: "AM" },
  AO: { code: "AO", name: "Angola", dialCode: "+244", flag: "AO" },
  AR: { code: "AR", name: "Argentina", dialCode: "+54", flag: "AR" },
  AS: { code: "AS", name: "American Samoa", dialCode: "+1", flag: "AS" },
  AT: { code: "AT", name: "Austria", dialCode: "+43", flag: "AT" },
  AU: { code: "AU", name: "Australia", dialCode: "+61", flag: "AU" },
  AW: { code: "AW", name: "Aruba", dialCode: "+297", flag: "AW" },
  AX: { code: "AX", name: "Åland Islands", dialCode: "+358", flag: "AX" },
  AZ: { code: "AZ", name: "Azerbaijan", dialCode: "+994", flag: "AZ" },
  BA: {
    code: "BA",
    name: "Bosnia and Herzegovina",
    dialCode: "+387",
    flag: "BA",
  },
  BB: { code: "BB", name: "Barbados", dialCode: "+1", flag: "BB" },
  BD: { code: "BD", name: "Bangladesh", dialCode: "+880", flag: "BD" },
  BE: { code: "BE", name: "Belgium", dialCode: "+32", flag: "BE" },
  BF: { code: "BF", name: "Burkina Faso", dialCode: "+226", flag: "BF" },
  BG: { code: "BG", name: "Bulgaria", dialCode: "+359", flag: "BG" },
  BH: { code: "BH", name: "Bahrain", dialCode: "+973", flag: "BH", rtl: true },
  BI: { code: "BI", name: "Burundi", dialCode: "+257", flag: "BI" },
  BJ: { code: "BJ", name: "Benin", dialCode: "+229", flag: "BJ" },
  BL: { code: "BL", name: "Saint Barthélemy", dialCode: "+590", flag: "BL" },
  BM: { code: "BM", name: "Bermuda", dialCode: "+1", flag: "BM" },
  BN: { code: "BN", name: "Brunei", dialCode: "+673", flag: "BN" },
  BO: { code: "BO", name: "Bolivia", dialCode: "+591", flag: "BO" },
  BQ: {
    code: "BQ",
    name: "Caribbean Netherlands",
    dialCode: "+599",
    flag: "BQ",
  },
  BR: { code: "BR", name: "Brazil", dialCode: "+55", flag: "BR" },
  BS: { code: "BS", name: "Bahamas", dialCode: "+1", flag: "BS" },
  BT: { code: "BT", name: "Bhutan", dialCode: "+975", flag: "BT" },
  BW: { code: "BW", name: "Botswana", dialCode: "+267", flag: "BW" },
  BY: { code: "BY", name: "Belarus", dialCode: "+375", flag: "BY" },
  BZ: { code: "BZ", name: "Belize", dialCode: "+501", flag: "BZ" },
  CA: { code: "CA", name: "Canada", dialCode: "+1", flag: "CA" },
  CC: {
    code: "CC",
    name: "Cocos (Keeling) Islands",
    dialCode: "+61",
    flag: "CC",
  },
  CD: { code: "CD", name: "DR Congo", dialCode: "+243", flag: "CD" },
  CF: {
    code: "CF",
    name: "Central African Republic",
    dialCode: "+236",
    flag: "CF",
  },
  CG: { code: "CG", name: "Congo Republic", dialCode: "+242", flag: "CG" },
  CH: { code: "CH", name: "Switzerland", dialCode: "+41", flag: "CH" },
  CI: { code: "CI", name: "Côte d’Ivoire", dialCode: "+225", flag: "CI" },
  CK: { code: "CK", name: "Cook Islands", dialCode: "+682", flag: "CK" },
  CL: { code: "CL", name: "Chile", dialCode: "+56", flag: "CL" },
  CM: { code: "CM", name: "Cameroon", dialCode: "+237", flag: "CM" },
  CN: { code: "CN", name: "China", dialCode: "+86", flag: "CN" },
  CO: { code: "CO", name: "Colombia", dialCode: "+57", flag: "CO" },
  CR: { code: "CR", name: "Costa Rica", dialCode: "+506", flag: "CR" },
  CU: { code: "CU", name: "Cuba", dialCode: "+53", flag: "CU" },
  CV: { code: "CV", name: "Cape Verde", dialCode: "+238", flag: "CV" },
  CW: { code: "CW", name: "Curaçao", dialCode: "+599", flag: "CW" },
  CX: { code: "CX", name: "Christmas Island", dialCode: "+61", flag: "CX" },
  CY: { code: "CY", name: "Cyprus", dialCode: "+357", flag: "CY" },
  CZ: { code: "CZ", name: "Czechia", dialCode: "+420", flag: "CZ" },
  DE: { code: "DE", name: "Germany", dialCode: "+49", flag: "DE" },
  DJ: { code: "DJ", name: "Djibouti", dialCode: "+253", flag: "DJ" },
  DK: { code: "DK", name: "Denmark", dialCode: "+45", flag: "DK" },
  DM: { code: "DM", name: "Dominica", dialCode: "+1", flag: "DM" },
  DO: { code: "DO", name: "Dominican Republic", dialCode: "+1", flag: "DO" },
  DZ: { code: "DZ", name: "Algeria", dialCode: "+213", flag: "DZ", rtl: true },
  EC: { code: "EC", name: "Ecuador", dialCode: "+593", flag: "EC" },
  EE: { code: "EE", name: "Estonia", dialCode: "+372", flag: "EE" },
  EG: { code: "EG", name: "Egypt", dialCode: "+20", flag: "EG", rtl: true },
  EH: { code: "EH", name: "Western Sahara", dialCode: "+212", flag: "EH" },
  ER: { code: "ER", name: "Eritrea", dialCode: "+291", flag: "ER" },
  ES: { code: "ES", name: "Spain", dialCode: "+34", flag: "ES" },
  ET: { code: "ET", name: "Ethiopia", dialCode: "+251", flag: "ET" },
  FI: { code: "FI", name: "Finland", dialCode: "+358", flag: "FI" },
  FJ: { code: "FJ", name: "Fiji", dialCode: "+679", flag: "FJ" },
  FK: { code: "FK", name: "Falkland Islands", dialCode: "+500", flag: "FK" },
  FM: { code: "FM", name: "Micronesia", dialCode: "+691", flag: "FM" },
  FO: { code: "FO", name: "Faroe Islands", dialCode: "+298", flag: "FO" },
  FR: { code: "FR", name: "France", dialCode: "+33", flag: "FR" },
  GA: { code: "GA", name: "Gabon", dialCode: "+241", flag: "GA" },
  GB: { code: "GB", name: "United Kingdom", dialCode: "+44", flag: "GB" },
  GD: { code: "GD", name: "Grenada", dialCode: "+1", flag: "GD" },
  GE: { code: "GE", name: "Georgia", dialCode: "+995", flag: "GE" },
  GF: { code: "GF", name: "French Guiana", dialCode: "+594", flag: "GF" },
  GG: { code: "GG", name: "Guernsey", dialCode: "+44", flag: "GG" },
  GH: { code: "GH", name: "Ghana", dialCode: "+233", flag: "GH" },
  GI: { code: "GI", name: "Gibraltar", dialCode: "+350", flag: "GI" },
  GL: { code: "GL", name: "Greenland", dialCode: "+299", flag: "GL" },
  GM: { code: "GM", name: "Gambia", dialCode: "+220", flag: "GM" },
  GN: { code: "GN", name: "Guinea", dialCode: "+224", flag: "GN" },
  GP: { code: "GP", name: "Guadeloupe", dialCode: "+590", flag: "GP" },
  GQ: { code: "GQ", name: "Equatorial Guinea", dialCode: "+240", flag: "GQ" },
  GR: { code: "GR", name: "Greece", dialCode: "+30", flag: "GR" },
  GT: { code: "GT", name: "Guatemala", dialCode: "+502", flag: "GT" },
  GU: { code: "GU", name: "Guam", dialCode: "+1", flag: "GU" },
  GW: { code: "GW", name: "Guinea-Bissau", dialCode: "+245", flag: "GW" },
  GY: { code: "GY", name: "Guyana", dialCode: "+592", flag: "GY" },
  HK: { code: "HK", name: "Hong Kong", dialCode: "+852", flag: "HK" },
  HN: { code: "HN", name: "Honduras", dialCode: "+504", flag: "HN" },
  HR: { code: "HR", name: "Croatia", dialCode: "+385", flag: "HR" },
  HT: { code: "HT", name: "Haiti", dialCode: "+509", flag: "HT" },
  HU: { code: "HU", name: "Hungary", dialCode: "+36", flag: "HU" },
  ID: { code: "ID", name: "Indonesia", dialCode: "+62", flag: "ID" },
  IE: { code: "IE", name: "Ireland", dialCode: "+353", flag: "IE" },
  IL: { code: "IL", name: "Israel", dialCode: "+972", flag: "IL", rtl: true },
  IM: { code: "IM", name: "Isle of Man", dialCode: "+44", flag: "IM" },
  IN: { code: "IN", name: "India", dialCode: "+91", flag: "IN" },
  IO: {
    code: "IO",
    name: "British Indian Ocean Territory",
    dialCode: "+246",
    flag: "IO",
  },
  IQ: { code: "IQ", name: "Iraq", dialCode: "+964", flag: "IQ", rtl: true },
  IR: { code: "IR", name: "Iran", dialCode: "+98", flag: "IR", rtl: true },
  IS: { code: "IS", name: "Iceland", dialCode: "+354", flag: "IS" },
  IT: { code: "IT", name: "Italy", dialCode: "+39", flag: "IT" },
  JE: { code: "JE", name: "Jersey", dialCode: "+44", flag: "JE" },
  JM: { code: "JM", name: "Jamaica", dialCode: "+1", flag: "JM" },
  JO: { code: "JO", name: "Jordan", dialCode: "+962", flag: "JO", rtl: true },
  JP: { code: "JP", name: "Japan", dialCode: "+81", flag: "JP" },
  KE: { code: "KE", name: "Kenya", dialCode: "+254", flag: "KE" },
  KG: { code: "KG", name: "Kyrgyzstan", dialCode: "+996", flag: "KG" },
  KH: { code: "KH", name: "Cambodia", dialCode: "+855", flag: "KH" },
  KI: { code: "KI", name: "Kiribati", dialCode: "+686", flag: "KI" },
  KM: { code: "KM", name: "Comoros", dialCode: "+269", flag: "KM" },
  KN: { code: "KN", name: "Saint Kitts and Nevis", dialCode: "+1", flag: "KN" },
  KP: { code: "KP", name: "North Korea", dialCode: "+850", flag: "KP" },
  KR: { code: "KR", name: "South Korea", dialCode: "+82", flag: "KR" },
  KW: { code: "KW", name: "Kuwait", dialCode: "+965", flag: "KW", rtl: true },
  KY: { code: "KY", name: "Cayman Islands", dialCode: "+1", flag: "KY" },
  KZ: { code: "KZ", name: "Kazakhstan", dialCode: "+7", flag: "KZ" },
  LA: { code: "LA", name: "Laos", dialCode: "+856", flag: "LA" },
  LB: { code: "LB", name: "Lebanon", dialCode: "+961", flag: "LB", rtl: true },
  LC: { code: "LC", name: "Saint Lucia", dialCode: "+1", flag: "LC" },
  LI: { code: "LI", name: "Liechtenstein", dialCode: "+423", flag: "LI" },
  LK: { code: "LK", name: "Sri Lanka", dialCode: "+94", flag: "LK" },
  LR: { code: "LR", name: "Liberia", dialCode: "+231", flag: "LR" },
  LS: { code: "LS", name: "Lesotho", dialCode: "+266", flag: "LS" },
  LT: { code: "LT", name: "Lithuania", dialCode: "+370", flag: "LT" },
  LU: { code: "LU", name: "Luxembourg", dialCode: "+352", flag: "LU" },
  LV: { code: "LV", name: "Latvia", dialCode: "+371", flag: "LV" },
  LY: { code: "LY", name: "Libya", dialCode: "+218", flag: "LY", rtl: true },
  MA: { code: "MA", name: "Morocco", dialCode: "+212", flag: "MA", rtl: true },
  MC: { code: "MC", name: "Monaco", dialCode: "+377", flag: "MC" },
  MD: { code: "MD", name: "Moldova", dialCode: "+373", flag: "MD" },
  ME: { code: "ME", name: "Montenegro", dialCode: "+382", flag: "ME" },
  MF: { code: "MF", name: "Saint Martin", dialCode: "+590", flag: "MF" },
  MG: { code: "MG", name: "Madagascar", dialCode: "+261", flag: "MG" },
  MH: { code: "MH", name: "Marshall Islands", dialCode: "+692", flag: "MH" },
  MK: { code: "MK", name: "North Macedonia", dialCode: "+389", flag: "MK" },
  ML: { code: "ML", name: "Mali", dialCode: "+223", flag: "ML" },
  MM: { code: "MM", name: "Myanmar", dialCode: "+95", flag: "MM" },
  MN: { code: "MN", name: "Mongolia", dialCode: "+976", flag: "MN" },
  MO: { code: "MO", name: "Macao", dialCode: "+853", flag: "MO" },
  MP: {
    code: "MP",
    name: "Northern Mariana Islands",
    dialCode: "+1",
    flag: "MP",
  },
  MQ: { code: "MQ", name: "Martinique", dialCode: "+596", flag: "MQ" },
  MR: {
    code: "MR",
    name: "Mauritania",
    dialCode: "+222",
    flag: "MR",
    rtl: true,
  },
  MS: { code: "MS", name: "Montserrat", dialCode: "+1", flag: "MS" },
  MT: { code: "MT", name: "Malta", dialCode: "+356", flag: "MT" },
  MU: { code: "MU", name: "Mauritius", dialCode: "+230", flag: "MU" },
  MV: { code: "MV", name: "Maldives", dialCode: "+960", flag: "MV" },
  MW: { code: "MW", name: "Malawi", dialCode: "+265", flag: "MW" },
  MX: { code: "MX", name: "Mexico", dialCode: "+52", flag: "MX" },
  MY: { code: "MY", name: "Malaysia", dialCode: "+60", flag: "MY" },
  MZ: { code: "MZ", name: "Mozambique", dialCode: "+258", flag: "MZ" },
  NA: { code: "NA", name: "Namibia", dialCode: "+264", flag: "NA" },
  NC: { code: "NC", name: "New Caledonia", dialCode: "+687", flag: "NC" },
  NE: { code: "NE", name: "Niger", dialCode: "+227", flag: "NE" },
  NF: { code: "NF", name: "Norfolk Island", dialCode: "+672", flag: "NF" },
  NG: { code: "NG", name: "Nigeria", dialCode: "+234", flag: "NG" },
  NI: { code: "NI", name: "Nicaragua", dialCode: "+505", flag: "NI" },
  NL: { code: "NL", name: "Netherlands", dialCode: "+31", flag: "NL" },
  NO: { code: "NO", name: "Norway", dialCode: "+47", flag: "NO" },
  NP: { code: "NP", name: "Nepal", dialCode: "+977", flag: "NP" },
  NR: { code: "NR", name: "Nauru", dialCode: "+674", flag: "NR" },
  NU: { code: "NU", name: "Niue", dialCode: "+683", flag: "NU" },
  NZ: { code: "NZ", name: "New Zealand", dialCode: "+64", flag: "NZ" },
  OM: { code: "OM", name: "Oman", dialCode: "+968", flag: "OM", rtl: true },
  PA: { code: "PA", name: "Panama", dialCode: "+507", flag: "PA" },
  PE: { code: "PE", name: "Peru", dialCode: "+51", flag: "PE" },
  PF: { code: "PF", name: "French Polynesia", dialCode: "+689", flag: "PF" },
  PG: { code: "PG", name: "Papua New Guinea", dialCode: "+675", flag: "PG" },
  PH: { code: "PH", name: "Philippines", dialCode: "+63", flag: "PH" },
  PK: { code: "PK", name: "Pakistan", dialCode: "+92", flag: "PK", rtl: true },
  PL: { code: "PL", name: "Poland", dialCode: "+48", flag: "PL" },
  PM: {
    code: "PM",
    name: "Saint Pierre and Miquelon",
    dialCode: "+508",
    flag: "PM",
  },
  PR: { code: "PR", name: "Puerto Rico", dialCode: "+1", flag: "PR" },
  PS: {
    code: "PS",
    name: "Palestine",
    dialCode: "+970",
    flag: "PS",
    rtl: true,
  },
  PT: { code: "PT", name: "Portugal", dialCode: "+351", flag: "PT" },
  PW: { code: "PW", name: "Palau", dialCode: "+680", flag: "PW" },
  PY: { code: "PY", name: "Paraguay", dialCode: "+595", flag: "PY" },
  QA: { code: "QA", name: "Qatar", dialCode: "+974", flag: "QA", rtl: true },
  RE: { code: "RE", name: "Réunion", dialCode: "+262", flag: "RE" },
  RO: { code: "RO", name: "Romania", dialCode: "+40", flag: "RO" },
  RS: { code: "RS", name: "Serbia", dialCode: "+381", flag: "RS" },
  RU: { code: "RU", name: "Russia", dialCode: "+7", flag: "RU" },
  RW: { code: "RW", name: "Rwanda", dialCode: "+250", flag: "RW" },
  SA: {
    code: "SA",
    name: "Saudi Arabia",
    dialCode: "+966",
    flag: "SA",
    rtl: true,
  },
  SB: { code: "SB", name: "Solomon Islands", dialCode: "+677", flag: "SB" },
  SC: { code: "SC", name: "Seychelles", dialCode: "+248", flag: "SC" },
  SD: { code: "SD", name: "Sudan", dialCode: "+249", flag: "SD", rtl: true },
  SE: { code: "SE", name: "Sweden", dialCode: "+46", flag: "SE" },
  SG: { code: "SG", name: "Singapore", dialCode: "+65", flag: "SG" },
  SH: { code: "SH", name: "Saint Helena", dialCode: "+290", flag: "SH" },
  SI: { code: "SI", name: "Slovenia", dialCode: "+386", flag: "SI" },
  SJ: {
    code: "SJ",
    name: "Svalbard and Jan Mayen",
    dialCode: "+47",
    flag: "SJ",
  },
  SK: { code: "SK", name: "Slovakia", dialCode: "+421", flag: "SK" },
  SL: { code: "SL", name: "Sierra Leone", dialCode: "+232", flag: "SL" },
  SM: { code: "SM", name: "San Marino", dialCode: "+378", flag: "SM" },
  SN: { code: "SN", name: "Senegal", dialCode: "+221", flag: "SN" },
  SO: { code: "SO", name: "Somalia", dialCode: "+252", flag: "SO" },
  SR: { code: "SR", name: "Suriname", dialCode: "+597", flag: "SR" },
  SS: { code: "SS", name: "South Sudan", dialCode: "+211", flag: "SS" },
  ST: {
    code: "ST",
    name: "São Tomé and Príncipe",
    dialCode: "+239",
    flag: "ST",
  },
  SV: { code: "SV", name: "El Salvador", dialCode: "+503", flag: "SV" },
  SX: { code: "SX", name: "Sint Maarten", dialCode: "+1", flag: "SX" },
  SY: { code: "SY", name: "Syria", dialCode: "+963", flag: "SY", rtl: true },
  SZ: { code: "SZ", name: "Eswatini", dialCode: "+268", flag: "SZ" },
  TC: {
    code: "TC",
    name: "Turks and Caicos Islands",
    dialCode: "+1",
    flag: "TC",
  },
  TD: { code: "TD", name: "Chad", dialCode: "+235", flag: "TD" },
  TG: { code: "TG", name: "Togo", dialCode: "+228", flag: "TG" },
  TH: { code: "TH", name: "Thailand", dialCode: "+66", flag: "TH" },
  TJ: { code: "TJ", name: "Tajikistan", dialCode: "+992", flag: "TJ" },
  TK: { code: "TK", name: "Tokelau", dialCode: "+690", flag: "TK" },
  TL: { code: "TL", name: "Timor-Leste", dialCode: "+670", flag: "TL" },
  TM: { code: "TM", name: "Turkmenistan", dialCode: "+993", flag: "TM" },
  TN: { code: "TN", name: "Tunisia", dialCode: "+216", flag: "TN", rtl: true },
  TO: { code: "TO", name: "Tonga", dialCode: "+676", flag: "TO" },
  TR: { code: "TR", name: "Turkey", dialCode: "+90", flag: "TR" },
  TT: { code: "TT", name: "Trinidad and Tobago", dialCode: "+1", flag: "TT" },
  TV: { code: "TV", name: "Tuvalu", dialCode: "+688", flag: "TV" },
  TW: { code: "TW", name: "Taiwan", dialCode: "+886", flag: "TW" },
  TZ: { code: "TZ", name: "Tanzania", dialCode: "+255", flag: "TZ" },
  UA: { code: "UA", name: "Ukraine", dialCode: "+380", flag: "UA" },
  UG: { code: "UG", name: "Uganda", dialCode: "+256", flag: "UG" },
  US: { code: "US", name: "United States", dialCode: "+1", flag: "US" },
  UY: { code: "UY", name: "Uruguay", dialCode: "+598", flag: "UY" },
  UZ: { code: "UZ", name: "Uzbekistan", dialCode: "+998", flag: "UZ" },
  VA: { code: "VA", name: "Vatican City", dialCode: "+39", flag: "VA" },
  VC: {
    code: "VC",
    name: "Saint Vincent and the Grenadines",
    dialCode: "+1",
    flag: "VC",
  },
  VE: { code: "VE", name: "Venezuela", dialCode: "+58", flag: "VE" },
  VG: {
    code: "VG",
    name: "British Virgin Islands",
    dialCode: "+1",
    flag: "VG",
  },
  VI: { code: "VI", name: "U.S. Virgin Islands", dialCode: "+1", flag: "VI" },
  VN: { code: "VN", name: "Vietnam", dialCode: "+84", flag: "VN" },
  VU: { code: "VU", name: "Vanuatu", dialCode: "+678", flag: "VU" },
  WF: { code: "WF", name: "Wallis and Futuna", dialCode: "+681", flag: "WF" },
  WS: { code: "WS", name: "Samoa", dialCode: "+685", flag: "WS" },
  XK: { code: "XK", name: "Kosovo", dialCode: "+383", flag: "XK" },
  YE: { code: "YE", name: "Yemen", dialCode: "+967", flag: "YE", rtl: true },
  YT: { code: "YT", name: "Mayotte", dialCode: "+262", flag: "YT" },
  ZA: { code: "ZA", name: "South Africa", dialCode: "+27", flag: "ZA" },
  ZM: { code: "ZM", name: "Zambia", dialCode: "+260", flag: "ZM" },
  ZW: { code: "ZW", name: "Zimbabwe", dialCode: "+263", flag: "ZW" },
};
