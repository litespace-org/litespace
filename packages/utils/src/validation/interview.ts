import {
  HTML_REGEX,
  HTML_TAGS_REGEX,
  MAX_FEEDBACK_TEXT_LENGTH,
  MAX_INTERVIEW_LEVEL,
  MAX_NOTE_TEXT_LENGTH,
  MIN_FEEDBACK_TEXT_LENGTH,
  MIN_INTERVIEW_LEVEL,
  MIN_NOTE_TEXT_LENGTH,
} from "@/constants";
import { FieldError } from "@litespace/types";
import { getSafeInnerHtmlText } from "@/utils";

export function isValidInterviewFeedback(
  feedback: string
):
  | FieldError.TooLongInterviewFeedback
  | FieldError.TooShortInterviewFeedback
  | FieldError.InvalidInterviewFeedback
  | true {
  const feedbackText = getSafeInnerHtmlText(feedback);

  if (!HTML_REGEX.test(feedback)) return FieldError.InvalidInterviewFeedback;
  if (feedbackText.length < MIN_FEEDBACK_TEXT_LENGTH)
    return FieldError.TooShortInterviewFeedback;
  if (feedbackText.length > MAX_FEEDBACK_TEXT_LENGTH)
    return FieldError.TooLongInterviewFeedback;
  return true;
}
export function isValidInterviewNote(
  note: string
):
  | FieldError.TooLongInterviewNote
  | FieldError.TooShortInterviewNote
  | FieldError.InvalidInterviewNote
  | true {
  const noteText = note.replace(HTML_TAGS_REGEX, "");

  if (!HTML_REGEX.test(note)) return FieldError.InvalidInterviewNote;
  if (noteText.length < MIN_NOTE_TEXT_LENGTH)
    return FieldError.TooShortInterviewNote;
  if (noteText.length > MAX_NOTE_TEXT_LENGTH)
    return FieldError.TooLongInterviewNote;
  return true;
}

export function isValidInterviewLevel(
  level: number
): FieldError.TooLowInterviewLevel | FieldError.TooHighInterviewLevel | true {
  if (level < MIN_INTERVIEW_LEVEL) return FieldError.TooLowInterviewLevel;
  if (level > MAX_INTERVIEW_LEVEL) return FieldError.TooHighInterviewLevel;
  return true;
}
