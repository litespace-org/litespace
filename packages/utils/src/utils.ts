import { sanitizeMessage } from "@/chat";
import { HTML_TAGS_REGEX } from "@/constants";

export function orUndefined<T>(value: T): NonNullable<T> | undefined {
  return value || undefined;
}

export function orNull<T>(value: T): NonNullable<T> | null {
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
