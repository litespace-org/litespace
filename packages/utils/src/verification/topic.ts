import { MAX_TOPIC_LEGNTH, MIN_TOPIC_LEGNTH } from "@/constants";
import { FieldError } from "@litespace/types";

export function isValidTopicName(
  name: string
): FieldError.ShortTopicName | FieldError.LongTopicName | true {
  if (name.length < MIN_TOPIC_LEGNTH) return FieldError.ShortTopicName;
  if (name.length > MAX_TOPIC_LEGNTH) return FieldError.LongTopicName;
  return true;
}
