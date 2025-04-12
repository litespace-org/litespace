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
