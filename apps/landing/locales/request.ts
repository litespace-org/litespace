import { getRequestConfig } from "next-intl/server";
import { getUserLocale } from "@/utils/intl";
import ar from "@/locales/ar-eg.json";

export type LocalMap = Record<keyof typeof ar, keyof typeof ar>;

export type LocalId = keyof LocalMap;

export default getRequestConfig(async () => {
  const locale = await getUserLocale();

  return {
    locale,
    messages: (await import(`./${locale}.json`)).default,
  };
});
