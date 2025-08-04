import { isValidBankNumber } from "@/validation/invoice";
import {
  generateValidLuhnNumber,
  generateInvalidLuhnNumber,
} from "./luhnGenerator";
import { FieldError } from "@litespace/types";

describe("isValidBankNumber - Generated numbers", () => {
  const validNumbers = Array.from({ length: 100 }, () =>
    generateValidLuhnNumber()
  );

  const invalidNumbers = Array.from({ length: 100 }, () =>
    generateInvalidLuhnNumber()
  );

  test.each(validNumbers)("✅ Valid: %s", (number) => {
    expect(isValidBankNumber(number)).toBe(true);
  });

  test.each(invalidNumbers)("❌ Invalid: %s", (number) => {
    expect(isValidBankNumber(number)).toBe(FieldError.InvalidBankAccountNumber);
  });
});
