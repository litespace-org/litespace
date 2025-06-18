import { dayjs } from "@/dayjs";

/**
 * see docs for fbc: https://developers.facebook.com/docs/marketing-api/conversions-api/parameters/fbp-and-fbc
 * @param fbclid parameter that is passed with the URL of an advertiser's website when a user
 * clicks an ad on Facebook and/or Instagram. You get that from url search params
 * @returns fbc which is a unique id for each user
 */
export function formatFbc(fbclid?: string | null) {
  if (!fbclid) return undefined;

  const host = window.location.hostname;
  const hostIndex = host.startsWith("www.") ? 2 : 1;
  const now = dayjs().valueOf();

  return `fb.${hostIndex}.${now}.${fbclid}`;
}
