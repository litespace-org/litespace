import { FieldError, IStudent } from "@litespace/types";

export function isValidEnglishLevel(
  level: IStudent.EnglishLevel
): FieldError.InvalidEnglishLevel | true {
  return (
    Object.values(IStudent.EnglishLevel).includes(level) ||
    FieldError.InvalidEnglishLevel
  );
}
