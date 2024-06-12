import { ISlot, IUser } from "@litespace/types";

export const userTypes = [
  { label: "Super Admin", value: IUser.Type.SuperAdmin },
  { label: "Regular Admin", value: IUser.Type.RegularAdmin },
  { label: "Tutor", value: IUser.Type.Tutor },
  { label: "Student", value: IUser.Type.Student },
  { label: "Examiner", value: IUser.Type.Examiner },
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
