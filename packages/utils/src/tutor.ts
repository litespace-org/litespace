import { ITutor, IUser } from "@litespace/types";

/*
 * check whether a tutor is activated (onboard) or not.
 */
export function isOnboard({
  activated,
  verifiedEmail,
  verifiedPhone,
  video,
  image,
  thumbnail,
  name,
  birthYear,
  about,
  bio,
  phone,
  role,
  city,
  bypassOnboarding,
}: ITutor.Full): boolean {
  const base =
    !!verifiedEmail &&
    !!image &&
    !!name &&
    !!about &&
    !!bio &&
    !!phone &&
    !!city &&
    activated;
  if (role === IUser.Role.TutorManager) return base || bypassOnboarding;
  return (
    (base && !!verifiedPhone && !!video && !!thumbnail && !!birthYear) ||
    bypassOnboarding
  );
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
