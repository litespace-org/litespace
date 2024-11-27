import { ICall, IFilter, IUser, Paginated } from "@/index";
import { NonEmptyList } from "@/utils";

export type Row = {
  id: number;
  start: Date;
  duration: number;
  price: number;
  rule_id: number;
  call_id: number | null;
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
  callId: number | null;
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
  host: boolean;
};

export type Member = {
  userId: number;
  lessonId: number;
  host: boolean;
};

export type PopuldatedMemberRow = {
  userId: number;
  lessonId: number;
  host: boolean;
  email: IUser.Row["email"];
  name: IUser.Row["name"];
  image: IUser.Row["image"];
  role: IUser.Role;
  createdAt: Date;
  updatedAt: Date;
};

export type PopuldatedMember = {
  userId: number;
  lessonId: number;
  host: boolean;
  email: IUser.Self["email"];
  name: IUser.Self["name"];
  image: IUser.Self["image"];
  role: IUser.Role;
  createdAt: string;
  updatedAt: string;
};

export type CreatePayload = {
  tutor: number;
  student: number;
  /**
   * Lesson price scaled to the power of 2.
   */
  price: number;
};

export type CreateApiPayload = {
  tutorId: number;
  ruleId: number;
  start: string;
  duration: Duration;
};

export type FindLessonsApiQuery = IFilter.Pagination & {
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
  members: PopuldatedMember[];
  call: ICall.Self;
}>;

export type CreateApiResponse = {
  lesson: Self;
  call: ICall.Self;
};

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
