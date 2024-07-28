import { ISlot, IUser } from "@litespace/types";

export const userTypes = [
  { label: "Super Admin", value: IUser.Role.SuperAdmin },
  { label: "Regular Admin", value: IUser.Role.RegularAdmin },
  { label: "Tutor", value: IUser.Role.Tutor },
  { label: "Student", value: IUser.Role.Student },
  { label: "Interviewer", value: IUser.Role.Interviewer },
  { label: "Media Provider", value: IUser.Role.MediaProvider },
];

export const weekdays = [
  { label: "None", value: -1 },
  { label: "Saturday", value: 6 },
  { label: "Sunday", value: 0 },
  { label: "Monday", value: 1 },
  { label: "Tuesday", value: 2 },
  { label: "Wednesday", value: 3 },
  { label: "Thursday", value: 4 },
  { label: "Friday", value: 5 },
];

export const repeat = [
  { label: "No Rpeat", value: ISlot.Repeat.No },
  { label: "Daily", value: ISlot.Repeat.Daily },
  { label: "Weekly", value: ISlot.Repeat.Weekly },
  { label: "Montly", value: ISlot.Repeat.Monthly },
];

export const genders = [
  { value: IUser.Gender.Male, label: "Male" },
  { value: IUser.Gender.Female, label: "Female" },
];

export const required = { required: true, message: "This field is required" };
