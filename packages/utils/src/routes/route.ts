export enum Web {
  Root = "/",
  Chat = "/chat",
  CompleteProfile = "/complete-profile",
  Checkout = "/checkout",
  Interviews = "/interviews",
  Invoices = "/invoices",
  Login = "/login",
  Payments = "/payments",
  Profile = "/profile",
  Register = "/register/:role",
  ResetPassword = "/reset-password",
  LessonsSchedule = "/lessons-schedule",
  ScheduleManagement = "/schedule-management",
  StudentDashboard = "/s/dashboard",
  TutorDashboard = "/t/dashboard",
  TutorAccountSettings = "/t/account-settings",
  TutorProfileSettings = "/t/profile-settings",
  StudentSettings = "/s/settings",
  Plans = "/plans",
  TutorOnboarding = "/t/onboarding",
  Interview = "/interview/:id",
  DemoSession = "/demo-session/:id",
  Tutors = "/tutors",
  TutorProfile = "/t/:id",
  Lessons = "/lessons",
  ForgetPassword = "/forget-password",
  Lesson = "/lesson/:id",
  Session = "/session",
  CardAdded = "/card-added",
  CompleteTutorProfile = "/t/complete-profile",
}

export enum Landing {
  Home = "/",
  Tutor = "/tutor",
  Terms = "/terms",
  Privacy = "/privacy",
  Pricing = "/pricing",
  Faq = "/faq",
  FaqRole = "/faq/:role",
  Contact = "/contact",
  ShortUrl = "/url/:name",
  Method = "/method",
  About = "/about",
}

export enum Dashboard {
  Root = "/",
  Invoices = "/invoices",
  Media = "/media",
  Login = "/login",
  Plans = "/plans",
  Users = "/users",
  User = "/user/:id",
  Interviews = "/interviews",
  Lessons = "/lessons",
  ServerStats = "/server-stats",
  PlatformSettings = "/platform-settings",
  Topics = "/topics",
  UserSetting = "/user-settings",
  PhotoSession = "/photo-session/:tutorId",
  PhotoSessions = "/photo-sessions",
  Tutor = "/tutor/:id",
  Tutors = "/tutors",
  PlanInvites = "/plan-invites",
  SessionEvents = "/session-events",
}

export type StudentSettingsTabId =
  | "personal"
  | "password"
  | "notifications"
  | "topics"
  | "refunds";
