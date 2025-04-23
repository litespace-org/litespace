import { CONFIRMATION_CODE_DIGIT_COUNT, isValidPhone } from "@litespace/utils";
import { random, range } from "lodash";
import { bad } from "@/lib/error";

export function generateConfirmationCode(): number {
  return Number(
    range(CONFIRMATION_CODE_DIGIT_COUNT)
      .map((_, index) => {
        /**
         * First digit should never be a zero.
         */
        const min = index === 0 ? 1 : 0;
        const max = 9;
        return random(min, max);
      })
      .join("")
  );
}

/**
 * just an ancillary function that make the handlers code less verbose.
 * it returns the userPhone in case it's not null, otherwise it validates
 * the payloadPhone then returns it if it's valid or an Error otherwise.
 */
export function selectPhone(
  userPhone: string | null,
  payloadPhone?: string
): string | Error {
  if (userPhone) return userPhone;

  if (!payloadPhone) return bad("Missing phone number");

  if (isValidPhone(payloadPhone) !== true) return bad("Invalid phone number");

  return payloadPhone;
}
