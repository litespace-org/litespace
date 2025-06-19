export enum Web {
  Root = "/",
  Chat = "/chat",
  CompleteProfile = "/complete-profile",
  Checkout = "/checkout/:planId/:period",
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
  UpcomingLessons = "/upcoming-lessons",
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
}

export type StudentSettingsTabId =
  | "personal"
  | "password"
  | "notifications"
  | "topics";

export const ApiRouteBaseRoute = "/api/v1";

type ApiRoutesType = Record<
  string,
  { base: ApiRouteBase; routes: Record<string, string> }
>;

export type ApiRouteBase =
  | "/auth"
  | "/contact-request"
  | "/user"
  | "/lesson"
  | "/interview"
  | "/availability-slot"
  | "/rating"
  | "/chat"
  | "/plan"
  | "/coupon"
  | "/invite"
  | "/invoice"
  | "/topic"
  | "/asset"
  | "/cache"
  | "/session"
  | "/fawry"
  | "/tx"
  | "/sub"
  | "/confirmation-code"
  | "/report";

export const ApiRoutes: ApiRoutesType = {
  auth: {
    base: "/auth",
    routes: {
      loginWithPassword: "/password",
      loginWithGoogle: "/google",
      refreshToken: "/refresh-token",
    },
  },
  contactRequest: {
    base: "/contact-request",
    routes: {
      create: "/",
    },
  },
  user: {
    base: "/user",
    routes: {
      create: "/",
      selectInterviewer: "/interviewer/select",
      findCurrentUser: "/current",
      findUsers: "/list",
      uploadUserImage: "/asset",
      uploadTutorAssets: "/asset/tutor",
      findTutorMeta: "/tutor/meta",
      findTutorInfo: "/tutor/info/:tutorId",
      findOnboardedTutors: "/tutor/list/onboarded",
      findPersonalizedTutorStats: "/tutor/stats/personalized",
      findUncontactedTutors: "/tutor/list/uncontacted",
      findTutorStats: "/tutor/stats/:tutor",
      findTutorActivityScores: "/tutor/activity/:tutor",
      findStudioTutors: "/tutor/all/for/studio",
      findStudioTutor: "/tutor/:tutorId/for/studio",
      findFullTutors: "/tutor/full-tutors",
      findTutoringMinutes: "/tutor/tutoring-minutes",
      findPersonalizedStudentStats: "/student/stats/personalized",
      findStudentStats: "/student/stats/:student",
      findStudios: "/studio/list",
      findById: "/:id",
      update: "/:id",
    },
  },
  lesson: {
    base: "/lesson",
    routes: {
      create: "/",
      update: "/",
      findAttendedLessonsStats: "/attended/stats",
      findLessons: "/list",
      findLessonById: "/:id",
      cancel: "/:lessonId",
    },
  },
  interview: {
    base: "/interview",
    routes: {
      create: "/",
      update: "/",
      find: "/list",
      selectInterviewer: "/select",
    },
  },
  availabilitySlot: {
    base: "/availability-slot",
    routes: {
      find: "/",
      set: "/",
    },
  },
  rating: {
    base: "/rating",
    routes: {
      createRating: "/",
      findRaterRatings: "/list/rater/:id",
      findRatings: "/list",
      findRateeRatings: "/list/ratee/:id",
      findTutorRatings: "/list/tutor/:id",
      findRatingById: "/:id",
      updateRating: "/:id",
      deleteRating: "/:id",
    },
  },
  chat: {
    base: "/chat",
    routes: {
      createRoom: "/new",
      findUserRooms: "/list/rooms/:userId",
      findRoomMessages: "/list/:roomId/messages",
      findRoomByMembers: "/room/by/members/",
      findRoomMembers: "/room/members/:roomId",
      updateRoom: "/room/:roomId",
    },
  },
  plan: {
    base: "/plan",
    routes: {
      create: "/",
      find: "/list",
      findById: "/:id",
      update: "/:id",
      delete: "/:id",
    },
  },
  coupon: {
    base: "/coupon",
    routes: {
      create: "/",
      findAll: "/list",
      findByCode: "/code/:code",
      findById: "/:id",
      update: "/:id",
      delete: "/:id",
    },
  },
  invite: {
    base: "/invite",
    routes: {
      create: "/",
      findAll: "/list",
      findById: "/:id",
      update: "/:id",
      delete: "/:id",
    },
  },
  invoice: {
    base: "/invoice",
    routes: {
      find: "/",
      stats: "/stats/:tutorId",
      create: "/",
      update: "/:invoiceId",
    },
  },
  topic: {
    base: "/topic",
    routes: {
      createTopic: "/",
      updateTopic: "/:id",
      deleteTopic: "/:id",
      findTopics: "/list",
      findUserTopics: "/of/user",
      addUserTopics: "/of/user",
      deleteUserTopics: "/of/user",
      replaceUserTopics: "/of/user",
    },
  },
  asset: {
    base: "/asset",
    routes: {
      sample: "/sample",
    },
  },
  cache: {
    base: "/cache",
    routes: {
      flush: "/flush",
    },
  },
  session: {
    base: "/session",
    routes: {
      getSessionToken: "/token",
      findSessionMembers: "/:sessionId",
    },
  },
  fawry: {
    base: "/fawry",
    routes: {
      payWithCard: "/pay/card",
      payWithRefNum: "/pay/ref-num",
      payWithEWallet: "/pay/e-wallet",
      payWithBankInstallments: "/pay/bank-installments",
      cancelUnpaidOrder: "/cancel-unpaid-order",
      refund: "/refund",
      getAddCardTokenUrl: "/card-token/url",
      findCardTokens: "/card-token/list",
      deleteCardToken: "/card-token",
      getPaymentStatus: "/payment-status",
      setPaymentStatus: "/payment-status",
      syncPaymentStatus: "/payment-status/sync",
    },
  },
  transaction: {
    base: "/tx",
    routes: {
      findLast: "/last",
      find: "/list",
      findById: "/:id",
    },
  },
  subscription: {
    base: "/sub",
    routes: {
      findUserSubscription: "/user",
      find: "/list",
      findById: "/:id",
    },
  },
  confirmationCode: {
    base: "/confirmation-code",
    routes: {
      sendVerifyPhoneCode: "/phone/send",
      verifyPhoneCode: "/phone/verify",
      sendForgetPasswordCode: "/password/send",
      confirmForgetPasswordCode: "/password/confirm",
      sendEmailVerificationCode: "/email/send",
      confirmEmailVerificationCode: "/email/confirm",
    },
  },
  report: {
    base: "/report",
    routes: {
      find: "/list",
      create: "/",
      update: "/",
    },
  },
};
