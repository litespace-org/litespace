export enum Route {
  Root = "/",
  Register = "/:role/register",
  Login = "/login",
  SelectUserType = "/select",
  SelectUserGender = "/gender",
  SetUserName = "/name",
  Tutors = "/tutors",
  Call = "/call/:id",
  TutorProfile = "/tutor/:id",
  TutorOnboarding = "/tutor/onboarding",
  Complete = "/complete",
}

export enum RoutePatterns {
  Register = "(/):role/register(/)",
  Login = "(/)login(/)",
  Call = "(/)call/:id(/)",
}
