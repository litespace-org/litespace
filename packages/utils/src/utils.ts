import { sanitizeMessage } from "@/chat";
import { HTML_TAGS_REGEX } from "@/constants";
import { isEmpty } from "lodash";

export function optional<T>(value: T): NonNullable<T> | undefined {
  return value || undefined;
}

export function nullable<T>(value: T): NonNullable<T> | null {
  return value || null;
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export function nameof<T extends Function>(f: T): string {
  return f.name;
}

export function getSafeInnerHtmlText(HTMLString: string): string {
  const sanitizedMessage = sanitizeMessage(HTMLString);
  return sanitizedMessage.replace(HTML_TAGS_REGEX, "");
}

export function getNullableFiledUpdatedValue<T>(
  current: T | null,
  future: T
): T | null | undefined {
  // User entered a new value and it doesn't match his current one.
  if (future && future !== current) return future;
  // User entered a new value and it is the same as his one.
  if (future === current) return undefined;
  // User removed the current value
  if (!future) return null;
  return undefined;
}

export function getOptionalFieldUpdatedValue<T>(
  current: T | null,
  future: T
): T | undefined {
  // User entered a new value and it doesn't match his current one.
  if (future && future !== current) return future;
  // User entered a new value and it is the same as his one.
  if (future === current) return undefined;
  return undefined;
}

/**
 * @description check if an object is empty.
 * @note undefiend properties will be dropped.
 * @note this function is designed to ignore/drop undefined props. if you want
 * to consider undefined props as other props, use `isEmpty` from lodash.
 */
export function isEmptyObject<T extends object>(value: T): boolean {
  // convert `value` to json and then to js object will drop all undefined props.
  return isEmpty(JSON.parse(JSON.stringify(value)));
}

export function joinUrl(base: string, route: string) {
  return new URL(route, base).href;
}
