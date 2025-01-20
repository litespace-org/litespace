export enum Route {
  Root = "/",
  Call = "/call/:id/:type",
  Chat = "/chat",
  Complete = "/complete",
  Interviews = "/interviews",
  Invoices = "/invoices",
  Login = "/login",
  Payments = "/payments",
  Profile = "/profile",
  Register = "/:role/register",
  ResetPassword = "/reset-password",
  Schedule = "/schedule",
  ScheduleManagement = "/schedule-management",
  SelectUserType = "/select",
  SelectUserGender = "/gender",
  SetUserName = "/name",
  StudentDashboard = "/s/dashboard",
  TutorDashboard = "/t/dashboard",
  TutorSettings = "/t/settings",
  StudentSettings = "/s/settings",
  Subscription = "/subscription",
  TutorOnboarding = "/tutor/onboarding",
  Tutors = "/tutors",
  TutorProfile = "/:id/tutor",
  UpcomingLessons = "/upcoming-lessons",
  VerifyEmail = "/verify-email",
  ForgetPassword = "/forget-password",
  Lesson = "/lesson/:id",
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
