export enum Route {
  Root = "/",
  ResetPassword = "/reset-password",
  Dashboard = "/dashboard",
  UpcomingLessons = "/upcoming-lessons",
  Schedule = "/schedule",
  EditSchedule = "/schedule/edit",
  Subscription = "/subscription",
  Settings = "/settings",
  Profile = "/profile",
  Payments = "/payments",
  Register = "/:role/register",
  Login = "/login",
  SelectUserType = "/select",
  SelectUserGender = "/gender",
  SetUserName = "/name",
  Tutors = "/tutors",
  Call = "/call/:id/:type",
  TutorProfile = "/:id/tutor",
  TutorOnboarding = "/tutor/onboarding",
  Complete = "/complete",
  Interviews = "/interviews",
  Invoices = "/invoices",
  Chat = "/chat",
  VerifyEmail = "/verify-email",
}

export enum RoutePatterns {
  Register = "(/):role/register(/)",
  Login = "(/)login(/)",
  Call = "(/)call/:id(/)",
  Dashboard = "(/)dashboard(/)",
  Schedule = "(/)schedule(/)",
  Subscription = "(/)subscription(/)",
  Settings = "(/)settings(/)",
  Profile = "(/)profile(/)",
  Payments = "(/)payments(/)",
  ResetPassword = "(/)reset-password(/)",
  VerifyEmail = "(/)verify-email(/)",
}
