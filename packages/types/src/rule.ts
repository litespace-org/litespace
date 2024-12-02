import { Weekday } from "@/date";

export type Self = {
  id: number;
  userId: number;
  title: string;
  frequency: Frequency;
  start: string;
  end: string;
  time: string;
  duration: number;
  weekdays: Weekday[];
  monthday: number | null;
  activated: boolean;
  deleted: boolean;
  createAt: string;
  updatedAt: string;
};

export type Row = {
  id: number;
  user_id: number;
  title: string;
  frequency: Frequency;
  start: Date;
  end: Date;
  time: string;
  duration: number;
  weekdays: string;
  monthday: number | null;
  activated: boolean;
  deleted: boolean;
  created_at: Date;
  updated_at: Date;
};

export type RuleEvent = {
  id: number;
  start: string;
  end: string;
};

export type CreatePayload = {
  userId: number;
  title: string;
  frequency: Frequency;
  start: string;
  end: string;
  time: string;
  duration: number;
  weekdays?: Weekday[];
  monthday?: number;
};

export enum Frequency {
  Daily,
  Weekly,
  Monthly,
}

export type CreateApiPayload = {
  title: string;
  frequency: Frequency;
  start: string;
  end: string;
  time: string;
  duration: number;
  weekdays?: Weekday[];
  monthday?: number;
};

export type UpdatePayload = {
  title?: string;
  frequency?: Frequency;
  start?: string;
  end?: string;
  time?: string;
  duration?: number;
  weekdays?: Weekday[];
  monthday?: number;
  activated?: boolean;
  deleted?: boolean;
};

export type UpdateApiPayload = Omit<UpdatePayload, "deleted">;

export type FindUnpackedUserRulesResponse = {
  rules: Self[];
  unpacked: RuleEvent[];
};

export type Cache = {
  tutor: number;
  rule: number;
  events: RuleEvent[];
};

/**
 * Slot: represents unpacked time slot at specific time and duration.
 *
 * @example a rule that is defined as "everyday from 5am to 6am" will have
 * these example slots below:
 * - "start from 'Fri 28 nov. 5:00am' and for 2 hours"
 * - "start from 'Sat 29 nov. 5:00am' and for 1 hours"
 */
export type Slot = {
  /**
   * Rule id that the slot belongs to.
   */
  ruleId: number;
  /**
   * ISO UTC datetime
   */
  start: string;
  /**
   * Slot duration in minutes
   */
  duration: number;
};
