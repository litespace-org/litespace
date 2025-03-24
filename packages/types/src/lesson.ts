import { ISession, IFilter, IUser, Paginated } from "@/index";

export type Row = {
  id: number;
  start: Date;
  duration: number;
  price: number;
  slot_id: number;
  session_id: ISession.Id;
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
  slotId: number;
  sessionId: ISession.Id;
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
};

export type PopulatedMember = {
  userId: number;
  lessonId: number;
  name: IUser.Self["name"];
  image: IUser.Self["image"];
  role: IUser.Role;
  phone: string | null;
  verifiedPhone: boolean;
};

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

export type FindLessonsApiQuery = IFilter.SkippablePagination & {
  users?: number[];
  ratified?: boolean;
  canceled?: boolean;
  future?: boolean;
  past?: boolean;
  now?: boolean;
  after?: string;
  before?: string;
};

export type FindUserLessonsApiResponse = Paginated<{
  lesson: Self;
  members: PopulatedMember[];
}>;

export enum Duration {
  Short = 15,
  Long = 30,
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

export type FindLessonByIdApiResponse = {
  lesson: Self;
  members: PopulatedMember[];
};
