import {
  ISession,
  IFilter,
  IUser,
  Paginated,
  IFawry,
  ITransaction,
} from "@/index";

export type Row = {
  id: number;
  start: Date;
  duration: number;
  price: number;
  slot_id: number;
  session_id: ISession.Id;
  tx_id: number | null;
  reported: boolean;
  canceled_by: number | null;
  canceled_at: Date | null;
  created_at: Date;
  updated_at: Date;
};

export type Self = {
  id: number;
  /**
   * ISO datetime
   */
  start: string;
  /**
   * Lesson duration in minutes.
   */
  duration: number;
  /**
   * Scaled lesson price to the power of 2.
   *
   * Example: 10.01 EGP is represented as 1001.
   */
  price: number;
  /**
   * The slot id that this lesson belongs to.
   */
  slotId: number;
  /**
   * The transaction id that is was used the process this lesson payment.
   */
  txId: number | null;
  sessionId: ISession.Id;
  /**
   * true if the student has reported the tutor
   */
  reported: boolean;
  /**
   * ID of the member who canceled the lesson.
   */
  canceledBy: number | null;
  /**
   * ISO datetime for the lesson cancellation time.
   */
  canceledAt: string | null;
  /**
   * ISO datetime
   *
   * Add only once when creating the lesson.
   */
  createdAt: string;
  /**
   * ISO datetime
   *
   * Updated every time the lesson row is updated.
   */
  updatedAt: string;
};

export type MetaSelf = Self & {
  txStatus: ITransaction.Status;
  txType: ITransaction.Type;
  txPaymentMethod: ITransaction.PaymentMethod;
  txFees: number;
  txAmount: number;
  txCreatedAt: string;
  orderRefNum: ITransaction.Self["providerRefNum"];
};

export type MemberRow = {
  user_id: number;
  lesson_id: number;
};

export type Member = {
  userId: number;
  lessonId: number;
};

export type PopulatedMemberRow = {
  user_id: number;
  lesson_id: number;
  name: IUser.Row["name"];
  image: IUser.Row["image"];
  role: IUser.Role;
  phone: string | null;
  verified_phone: boolean;
  notification_method: IUser.Row["notification_method"];
};

export type PopulatedMember = {
  userId: number;
  lessonId: number;
  name: IUser.Self["name"];
  image: IUser.Self["image"];
  role: IUser.Role;
  phone: string | null;
  notificationMethod: IUser.Self["notificationMethod"];
  verifiedPhone: boolean;
};

export type PaidLessonStatusLiteral =
  | "not-eligible"
  | "eligible-with-payment"
  | "eligible-without-payment";

export enum PaidLessonStatus {
  NotEligible = 1,
  Eligible = 2,
  EligibleWithPayment = 3,
  EligitbleWithoutPayment = 4,
}

export type CreatePayload = {
  /**
   * ISO UTC datetime.
   */
  start: string;
  /**
   * Lesson duration in minutes.
   */
  duration: number;
  tutor: number;
  student: number;
  slot: number;
  session: ISession.Id;
  txId?: number | null;
  /**
   * Lesson price scaled to the power of 2.
   */
  price: number;
};

export type UpdatePayload = {
  slotId?: number;
  /**
   * ISO UTC datetime.
   */
  start?: string;
  /**
   * Lesson duration in minutes.
   */
  duration?: number;
};

export type UpdateApiPayload = {
  lessonId: number;
  slotId: number;
  start: string;
  duration: Duration;
};

export type CreateApiPayload = {
  tutorId: number;
  slotId: number;
  start: string;
  duration: Duration;
};

export type CreateLessonApiResponse = Self;

export type UpdateLessonApiResponse = void;

export type CancelLessonApiParams = { id: number };
export type CancelLessonApiResponse = void;

export type ReportLessonApiParams = { id: number };
export type ReportLessonApiResponse = void;

export type FindLessonsApiQuery = IFilter.SkippablePagination & {
  users?: number[];
  ratified?: boolean;
  canceled?: boolean;
  reported?: boolean;
  future?: boolean;
  past?: boolean;
  now?: boolean;
  after?: string;
  before?: string;
};

export type FindUserLessonsApiResponse = Paginated<{
  lesson: Self;
  members: PopulatedMember[];
  files: string[];
}>;

export enum Duration {
  // Short = 15, // TODO: uncomment once the policy change
  Long = 45,
}

export type LessonDayRow = {
  start: Date;
  duration: Duration;
};

export type LessonDay = {
  start: string;
  duration: Duration;
};

export type LessonDayRows = LessonDayRow[];
export type LessonDays = LessonDay[];

export type FindBySessionIdApiQuery = {
  sessionId: ISession.Id;
};

export type FindLessonByIdApiResponse = {
  lesson: Self;
  members: PopulatedMember[];
};

export type FindLessonBySessionIdApiResponse = {
  lesson: Self;
  members: PopulatedMember[];
};

export type FindAttendedLessonsStatsApiQuery = {
  /**
   * an iso datetime string
   */
  after: string;
  /**
   * an iso date in format YYYY-MM-DD
   */
  before: string;
};

export type FindAttendedLessonsStatsApiResponse = Array<{
  /**
   * an iso date in format YYYY-MM-DD
   */
  date: string;
  paidTutoringMinutes: number;
  freeTutoringMinutes: number;
  paidLessonCount: number;
  freeLessonCount: number;
}>;

export type FindRefundableLessonsApiPayload = unknown;
export type FindRefundableLessonsApiResponse = Array<MetaSelf>;

export type CreateWithCardApiPayload = CreateApiPayload & {
  cardToken: string;
  cvv: string;
  phone?: string;
};

export type CreateWithFawryRefNumApiPayload = CreateApiPayload & {
  phone?: string;
};

export type CreateWithEWalletApiPayload = CreateApiPayload & {
  phone?: string;
};

export type CreateWithCardApiResponse = IFawry.PayWithCardResponse;

export type CreateWithFawryRefNumApiResponse = IFawry.PayWithRefNumResponse;

export type CreateWithEWalletApiResponse = IFawry.PayWithEWalletResponse;
