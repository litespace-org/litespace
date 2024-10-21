import { FieldError } from "@litespace/types";

export function isValidEmail(email: string): FieldError.InvalidEmail | boolean {
  const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;

  return emailRegex.test(email) || FieldError.InvalidEmail;
}

export function isValidPassword(
  password: string
):
  | FieldError.PasswordTooShort
  | FieldError.PasswordMissingLetters
  | FieldError.PasswordMissingNumbers
  | boolean {
  const passwordRegex = /[a-zA-Z1-9]{8,}/;

  if (!/\d/.test(password)) return FieldError.PasswordMissingNumbers;
  if (!/[a-zA-Z]/.test(password)) return FieldError.PasswordMissingLetters;
  if (password.length < 8) return FieldError.PasswordTooShort;

  return passwordRegex.test(password);
}

export function isValidUserName(
  userName: string
): FieldError.InvalidUserName | boolean {
  const userNameRegex = /^[\u0600-\u06ff\s]{2,}$/;
  return userNameRegex.test(userName) || FieldError.InvalidUserName;
}
export function isValidUserBirthYear(
  userBirthYear: number
): FieldError.TutorTooOld | FieldError.TutorTooYoung | boolean {
  if (new Date().getFullYear() - userBirthYear > 60)
    return FieldError.TutorTooOld;
  if (new Date().getFullYear() - userBirthYear < 10)
    return FieldError.TutorTooYoung;
  return true;
}

export function isValidTutorBio(
  tutorBio: string
): FieldError.TutorBioEmpty | FieldError.TutorBioTooLong | boolean {
  const tutorBioText = tutorBio.replace(/<[^>]*>/g, "");
  if (tutorBioText.length > 60) return FieldError.TutorBioTooLong;
  if (!tutorBioText.length) return FieldError.TutorBioEmpty;
  return true;
}

export function isValidTutorAbout(
  tutorAbout: string
): FieldError.TutorAboutEmpty | FieldError.TutorAboutTooLong | boolean {
  const tutorAboutText = tutorAbout.replace(/<[^>]*>/g, "");
  if (tutorAboutText.length > 1000) return FieldError.TutorAboutTooLong;
  if (!tutorAboutText.length) return FieldError.TutorAboutEmpty;
  return true;
}

// export function isValidTutorNotice() {

// }

export function isValidRuleTitle(
  ruleTitle: string
): FieldError.RuleTitleTooShort | FieldError.RuleTitleTooLong | Boolean {
  const ruleTitleText = ruleTitle.replace(/<[^>]*>/g, "");
  if (ruleTitleText.length > 255) return FieldError.RuleTitleTooLong;
  if (ruleTitleText.length < 5) return FieldError.RuleTitleTooShort;
  return true;
}

// rule start

// rule end

// rule duration

// // interviews

// interview feedback

// interview note

// interview level

// // rating

// rating value

// rating text

// // plan

// plan alias

// plan weekly minutes

// plan price

// plan discount

// // coupons

// coupon code

// doupon discount

// coupon expire date

// // messages

// message text

// // withdraw methods

// withdraw min amount
// withdraw max amount

// // invoices

// invoice receiver
// invoice amount
// invoice note
