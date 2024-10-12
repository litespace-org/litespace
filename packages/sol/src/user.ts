import { IUser } from "@litespace/types";

export function destructureRole(role: IUser.Role) {
  return {
    tutor: role === IUser.Role.Tutor,
    student: role === IUser.Role.Student,
    interviewer: role === IUser.Role.Interviewer,
    regularAdmin: role === IUser.Role.RegularAdmin,
    superAdmin: role === IUser.Role.SuperAdmin,
  };
}
