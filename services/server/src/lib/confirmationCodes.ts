import { CONFIRMATION_CODE_DIGIT_COUNT } from "@litespace/utils";
import { random, range } from "lodash";

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
