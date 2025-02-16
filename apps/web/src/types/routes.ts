export enum Route {
  Root = "/",
  Chat = "/chat",
  CompleteProfile = "/complete-profile",
  Interviews = "/interviews",
  Invoices = "/invoices",
  Login = "/login",
  Payments = "/payments",
  Profile = "/profile",
  Register = "/:role/register",
  ResetPassword = "/reset-password",
  LessonsSchedule = "/lessons-schedule",
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
  TutorProfile = "/t/:id",
  UpcomingLessons = "/upcoming-lessons",
  VerifyEmail = "/verify-email",
  ForgetPassword = "/forget-password",
  Lesson = "/lesson/:id",
}

export const TUTOR_PROFILE_REGEX = /\/t\/\d+\/?/;

export const VERIFY_EMAIL_CALLBACK_URL = window.location.origin.concat(
  Route.VerifyEmail
);

export enum RoutePatterns {
  Register = "(/):role/register(/)",
  Login = "(/)login(/)",
  Call = "(/)call/:id(/)",
  Dashboard = "(/)dashboard(/)",
  LessonsSchedule = "(/)lessons-schedule(/)",
  Subscription = "(/)subscription(/)",
  Settings = "(/)settings(/)",
  Profile = "(/)profile(/)",
  Payments = "(/)payments(/)",
  ResetPassword = "(/)reset-password(/)",
  VerifyEmail = "(/)verify-email(/)",
}
