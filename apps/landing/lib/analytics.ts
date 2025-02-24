/**
 * see docs for fbc: https://developers.facebook.com/docs/marketing-api/conversions-api/parameters/fbp-and-fbc
 * @param fbclid you get that from url search params
 * @returns fbc which is a unique id for each user
 */
export function formatFbc(fbclid: string | null) {
  if (!fbclid) return undefined;

  const host = window.location.hostname;
  const hostIndex = host.startsWith("www.") ? 2 : 1;
  const now = Date.now();

  return `fb.${hostIndex}.${now}.${fbclid}`;
}
