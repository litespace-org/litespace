"use server";

import { cookies } from "next/headers";
import { Locale, defaultLocale } from "@/locales/config";
import { getTranslations } from "next-intl/server";
import { LocalMap } from "@/locales/request";

// In this example the locale is read from a cookie. You could alternatively
// also read it from a database, backend service, or any other source.
const COOKIE_NAME = "NEXT_LOCALE";

export async function getUserLocale() {
  return cookies().get(COOKIE_NAME)?.value || defaultLocale;
}

export async function setUserLocale(locale: Locale) {
  cookies().set(COOKIE_NAME, locale);
}

export async function formatMessage() {
  const intl = await getTranslations();

  return (id: keyof LocalMap, values?: Record<string, string | number>) =>
    intl(id, values);
}
