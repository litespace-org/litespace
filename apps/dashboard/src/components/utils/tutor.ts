import { ITutor } from "@litespace/types";
import { LocalId } from "@litespace/ui/locales";

export const ONBOARD_VALUES: Array<keyof ITutor.OnboardInfo> = [
  "activated",
  "verifiedEmail",
  "verifiedPhone",
  "video",
  "image",
  "thumbnail",
  "name",
  "gender",
  "birthYear",
  "about",
  "bio",
  "phone",
  "role",
  "city",
];

export const ONBOARD_ITEMS_MAP: Record<keyof ITutor.OnboardInfo, LocalId> = {
  activated: "tutor.items.activated",
  name: "tutor.items.name",
  image: "tutor.items.image",
  video: "tutor.items.video",
  birthYear: "tutor.items.birthyear",
  role: "tutor.items.role",
  city: "tutor.items.city",
  phone: "tutor.items.phone",
  about: "tutor.items.about",
  bio: "tutor.items.bio",
  gender: "tutor.items.gender",
  thumbnail: "tutor.items.thumbnail",
  verifiedEmail: "tutor.items.verified-email",
  verifiedPhone: "tutor.items.verified-phone",
};
