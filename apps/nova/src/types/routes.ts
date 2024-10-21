export enum Route {
  Root = "/",
  Dashboard = "/dashboard",
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
  Call = "/call/:id",
  TutorProfile = "/:id/tutor",
  TutorOnboarding = "/tutor/onboarding",
  Complete = "/complete",
  Lessons = "/lessons",
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
  VerifyEmail = "(/)verify-email(/)",
}

export enum BackendPath {
  local = "http://localhost:5173",
  staging = "https://staging.litespace.org/api/v1",
  production = "https://app.litespace.org",
}
