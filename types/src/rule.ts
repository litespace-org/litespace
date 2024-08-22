import { Weekday } from "@/date";

export type Self = {
  id: number;
  userId: number;
  title: string;
  frequence: number;
  start: string;
  end: string;
  time: string;
  duration: number;
  weekdays: Weekday[];
  monthday?: number;
  createAt: string;
  updatedAt: string;
};

export type Row = {
  id: number;
  user_id: number;
  title: string;
  frequence: number;
  start: Date;
  end: Date;
  time: string;
  duration: number;
  weekdays: string;
  monthday: number | null;
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
  frequence: number;
  start: string;
  end: string;
  time: string;
  duration: number;
  weekdays?: Weekday[];
  monthday?: number;
};

export type CreateApiPayload = {
  title: string;
  frequence: number;
  start: string;
  end: string;
  time: string;
  duration: number;
  weekdays?: Weekday[];
  monthday?: number;
};

export type FindUnpackedUserRulesResponse = {
  rules: Self[];
  unpacked: RuleEvent[];
};
