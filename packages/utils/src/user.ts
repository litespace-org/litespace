import { IUser } from "@litespace/types";
import { GHOST_USERNAME_PREFIX } from "@/ghost";

export function destructureRole(role: IUser.Role) {
  const regularAdmin = role === IUser.Role.RegularAdmin;
  const superAdmin = role === IUser.Role.SuperAdmin;
  return {
    tutor: role === IUser.Role.Tutor,
    student: role === IUser.Role.Student,
    tutorManager: role === IUser.Role.TutorManager,
    studio: role === IUser.Role.Studio,
    regularAdmin,
    superAdmin,
    admin: regularAdmin || superAdmin,
  };
}

export function isUser(user: unknown): user is IUser.Self {
  return !!user && typeof user === "object" && "id" in user;
}

export function isSuperAdmin(user: unknown): user is IUser.Self {
  return isUser(user) && user.role === IUser.Role.SuperAdmin;
}

export function isRegAdmin(user: unknown): user is IUser.Self {
  return isUser(user) && user.role === IUser.Role.RegularAdmin;
}

export function isAdmin(user: unknown): user is IUser.Self {
  return isRegAdmin(user) || isSuperAdmin(user);
}

/**
 * Regular user:
 * 1. Tutor manager.
 * 2. Regular tutor.
 * 3. Student.
 */
export function isRegularUser(user: unknown): user is IUser.Self {
  return isTutorManager(user) || isRegularTutor(user) || isStudent(user);
}

/**
 * Tutor:
 * 1. Tutor manager.
 * 2. Regular tutor.
 */
export function isTutor(user: unknown): user is IUser.Self {
  return isUser(user) && (isRegularTutor(user) || isTutorManager(user));
}

export function isRegularTutor(user: unknown): user is IUser.Self {
  return isUser(user) && user.role === IUser.Role.Tutor;
}

export function isTutorManager(user: unknown): user is IUser.Self {
  return isUser(user) && user.role === IUser.Role.TutorManager;
}

export function isStudent(user: unknown): user is IUser.Self {
  return isUser(user) && user.role === IUser.Role.Student;
}

export function isStudio(user: unknown): user is IUser.Self {
  return isUser(user) && user.role === IUser.Role.Studio;
}

export function isValidRole(role: unknown): role is IUser.Role {
  return Object.values(IUser.Role).includes(role as IUser.Role);
}

export function isSuperAdminRole(
  role: IUser.Role
): role is IUser.Role.SuperAdmin {
  return role === IUser.Role.SuperAdmin;
}

export function isRegAdminRole(
  role: IUser.Role
): role is IUser.Role.RegularAdmin {
  return role === IUser.Role.RegularAdmin;
}

export function isAdminRole(
  role: IUser.Role
): role is IUser.Role.SuperAdmin | IUser.Role.RegularAdmin {
  return isRegAdminRole(role) || isSuperAdminRole(role);
}

/**
 * Regular user:
 * 1. Tutor manager.
 * 2. Regular tutor.
 * 3. Student.
 */
export function isRegularUserRole(
  role: IUser.Role
): role is IUser.Role.TutorManager | IUser.Role.Tutor | IUser.Role.Student {
  return (
    isTutorManagerRole(role) || isRegularTutorRole(role) || isStudentRole(role)
  );
}

/**
 * Tutor:
 * 1. Tutor manager.
 * 2. Regular tutor.
 */
export function isTutorRole(
  role: IUser.Role
): role is IUser.Role.Tutor | IUser.Role.TutorManager {
  return isRegularTutorRole(role) || isTutorManagerRole(role);
}

export function isRegularTutorRole(role: IUser.Role): role is IUser.Role.Tutor {
  return role === IUser.Role.Tutor;
}

export function isTutorManagerRole(
  role: IUser.Role
): role is IUser.Role.TutorManager {
  return role === IUser.Role.TutorManager;
}

export function isStudentRole(role: IUser.Role): role is IUser.Role.Student {
  return role === IUser.Role.Student;
}

export function isStudioRole(role: IUser.Role): role is IUser.Role.Studio {
  return role === IUser.Role.Studio;
}

/**
 * @deprecated Ghost mode will be removed.
 */
export function isGhost(user: unknown): user is IUser.Ghost {
  return (
    typeof user === "string" &&
    user.startsWith(GHOST_USERNAME_PREFIX) &&
    !Number.isNaN(Number(user.replace(GHOST_USERNAME_PREFIX, "")))
  );
}

export function getEmailUserName(email: string) {
  const [username] = email.split("@");
  return username || null;
}
