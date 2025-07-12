import { ITutor, IUser } from "@litespace/types";

/*
 * check whether a tutor is activated (onboard) or not.
 */
export function isOnboarded({
  activated,
  verifiedEmail,
  verifiedPhone,
  video,
  image,
  thumbnail,
  name,
  gender,
  birthYear,
  about,
  bio,
  phone,
  role,
  city,
}: ITutor.Full): boolean {
  const base =
    !!name &&
    !!phone &&
    !!city &&
    !!verifiedEmail &&
    !!gender &&
    !!birthYear &&
    !!bio &&
    !!about &&
    !!image &&
    !!verifiedPhone &&
    activated;
  if (role === IUser.Role.TutorManager) return base;
  return base && !!video && !!thumbnail;
}

export function isProfileComplete({
  name,
  phone,
  city,
  gender,
  birthYear,
  bio,
  about,
  verifiedPhone,
  verifiedEmail,
}: Pick<
  ITutor.Full,
  | "name"
  | "phone"
  | "city"
  | "gender"
  | "birthYear"
  | "bio"
  | "about"
  | "verifiedPhone"
  | "verifiedEmail"
>): boolean {
  return (
    !!name &&
    !!phone &&
    !!city &&
    !!gender &&
    !!birthYear &&
    !!bio &&
    !!about &&
    !!verifiedPhone &&
    !!verifiedEmail
  );
}
