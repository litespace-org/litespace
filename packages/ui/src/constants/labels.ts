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

export const arabicTimezoneNames = {
  // Africa
  "Africa/Cairo": "أفريقيا/القاهرة",
  "Africa/Lagos": "أفريقيا/لاغوس",
  "Africa/Nairobi": "أفريقيا/نيروبي",
  "Africa/Johannesburg": "أفريقيا/جوهانسبرغ",
  "Africa/Algiers": "أفريقيا/الجزائر",
  "Africa/Accra": "أفريقيا/أكرا",
  "Africa/Addis_Ababa": "أفريقيا/أديس أبابا",
  "Africa/Casablanca": "أفريقيا/الدار البيضاء",
  "Africa/Tunis": "أفريقيا/تونس",
  "Africa/Khartoum": "أفريقيا/الخرطوم",

  // Asia
  "Asia/Riyadh": "آسيا/الرياض",
  "Asia/Dubai": "آسيا/دبي",
  "Asia/Baghdad": "آسيا/بغداد",
  "Asia/Amman": "آسيا/عمان",
  "Asia/Beirut": "آسيا/بيروت",
  "Asia/Damascus": "آسيا/دمشق",
  "Asia/Jerusalem": "آسيا/القدس",
  "Asia/Kuwait": "آسيا/الكويت",
  "Asia/Qatar": "آسيا/قطر",
  "Asia/Bahrain": "آسيا/البحرين",
  "Asia/Tehran": "آسيا/طهران",
  "Asia/Karachi": "آسيا/كراتشي",
  "Asia/Kolkata": "آسيا/كولكاتا",
  "Asia/Dhaka": "آسيا/دكا",
  "Asia/Bangkok": "آسيا/بانكوك",
  "Asia/Jakarta": "آسيا/جاكرتا",
  "Asia/Tokyo": "آسيا/طوكيو",
  "Asia/Seoul": "آسيا/سيول",
  "Asia/Shanghai": "آسيا/شانغهاي",
  "Asia/Singapore": "آسيا/سنغافورة",
  "Asia/Hong_Kong": "آسيا/هونغ كونغ",

  // Europe
  "Europe/London": "أوروبا/لندن",
  "Europe/Paris": "أوروبا/باريس",
  "Europe/Berlin": "أوروبا/برلين",
  "Europe/Moscow": "أوروبا/موسكو",
  "Europe/Istanbul": "أوروبا/إسطنبول",
  "Europe/Madrid": "أوروبا/مدريد",
  "Europe/Rome": "أوروبا/روما",
  "Europe/Amsterdam": "أوروبا/أمستردام",
  "Europe/Athens": "أوروبا/أثينا",
  "Europe/Lisbon": "أوروبا/لشبونة",

  // America
  "America/New_York": "أمريكا/نيويورك",
  "America/Los_Angeles": "أمريكا/لوس أنجلوس",
  "America/Chicago": "أمريكا/شيكاغو",
  "America/Toronto": "أمريكا/تورونتو",
  "America/Mexico_City": "أمريكا/مدينة المكسيك",
  "America/Sao_Paulo": "أمريكا/ساو باولو",
  "America/Buenos_Aires": "أمريكا/بوينس آيرس",
  "America/Bogota": "أمريكا/بوغوتا",
  "America/Lima": "أمريكا/ليما",
  "America/Santiago": "أمريكا/سانتياغو",

  // Australia
  "Australia/Sydney": "أستراليا/سيدني",
  "Australia/Melbourne": "أستراليا/ملبورن",
  "Australia/Perth": "أستراليا/بيرث",
  "Australia/Brisbane": "أستراليا/بريسبان",
  "Australia/Adelaide": "أستراليا/أديلايد",

  // Pacific
  "Pacific/Auckland": "المحيط الهادئ/أوكلاند",
  "Pacific/Fiji": "المحيط الهادئ/فيجي",
  "Pacific/Honolulu": "المحيط الهادئ/هونولولو",

  // Others
  UTC: "العالمي/التوقيت العالمي المنسق",
} as const;
