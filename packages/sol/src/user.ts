import { IUser } from "@litespace/types";

export function destructureRole(role: IUser.Role) {
  const regularAdmin = role === IUser.Role.RegularAdmin;
  const superAdmin = role === IUser.Role.SuperAdmin;
  return {
    tutor: role === IUser.Role.Tutor,
    student: role === IUser.Role.Student,
    tutorManager: role === IUser.Role.TutorManager,
    mediaProvider: role === IUser.Role.MediaProvider,
    regularAdmin,
    superAdmin,
    admin: regularAdmin || superAdmin,
  };
}
