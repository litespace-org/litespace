import { ITutor, IUser } from "@litespace/types";

/*
 * check whether a tutor is activated (onboard) or not.
 */
export function isOnboard({
  activated,
  activatedBy,
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
  studioId,
}: ITutor.FullTutor): boolean {
  const base =
    !!verifiedEmail &&
    !!image &&
    !!name &&
    !!about &&
    !!bio &&
    !!phone &&
    !!city;

  if (role === IUser.Role.TutorManager) return base;

  return (
    base &&
    !!verifiedPhone &&
    !!activated &&
    !!activatedBy &&
    !!video &&
    !!thumbnail &&
    // TODO: Collect this info from Other tutors
    !!birthYear &&
    !!studioId
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
}: Pick<
  ITutor.FullTutor,
  | "name"
  | "phone"
  | "city"
  | "gender"
  | "birthYear"
  | "bio"
  | "about"
  | "verifiedPhone"
>): boolean {
  return (
    !!name &&
    !!phone &&
    !!city &&
    !!gender &&
    !!birthYear &&
    !!bio &&
    !!about &&
    !!verifiedPhone
  );
}
