export enum Web {
  Root = "/",
  Chat = "/chat",
  CompleteProfile = "/complete-profile",
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
  Session = "/session",
  BookInterview = "/book-interview",
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
  VerifyEmail = "/verify-email",
  UserSetting = "/user-settings",
  PhotoSession = "/photo-session/:tutorId",
  PhotoSessions = "/photo-sessions",
  Tutor = "/tutor/:id",
}
