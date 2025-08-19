import { IStudent } from "@litespace/types";
import { LocalId } from "@litespace/ui/locales";

export const languageLevels: Record<IStudent.EnglishLevel, LocalId> = {
  [IStudent.EnglishLevel.Beginner]: "labels.level.beginner",
  [IStudent.EnglishLevel.PreIntermediate]: "labels.level.pre-intermediate",
  [IStudent.EnglishLevel.Intermediate]: "labels.level.intermediate",
  [IStudent.EnglishLevel.UpperIntermediate]: "labels.level.upper-intermediate",
  [IStudent.EnglishLevel.Advanced]: "labels.level.advanced",
  [IStudent.EnglishLevel.Mastery]: "labels.level.mastery",
};
