import { IUser } from "@/index";

export enum Purpose {
  VerifyWhatsApp = 1,
  VerifyTelegram = 2,
  VerifyEmail = 3,
  ResetPassword = 4,
}

export type Self = {
  id: number;
  userId: number | null;
  code: number;
  purpose: Purpose;
  createdAt: string;
  expiresAt: string;
};

export type Row = {
  id: number;
  user_id: number | null;
  code: number;
  purpose: Purpose;
  created_at: Date;
  expires_at: Date;
};

export type Column = keyof Row;

export type Field = keyof Self;

export type CreatePayload = {
  userId?: number | null;
  purpose: Purpose;
  code: number;
  expiresAt: string;
};

export type FindModelPayload<T extends Field = Field> = {
  code?: number;
  userId?: number;
  purpose?: Purpose;
  select?: T[];
};

export type SendVerifyPhoneCodeApiPayload = {
  phone?: string;
  method: IUser.NotificationMethodLiteral;
};

export type VerifyPhoneCodeApiPayload = {
  code: number;
  method: IUser.NotificationMethodLiteral;
};

export type SendForgetPasswordEmailApiPayload = {
  email: string;
};

export type SendVerifyEmailApiPayload = {
  email: string;
};

export type ConfirmForgetPasswordCodeApiPayload = {
  password: string;
  code: number;
};

export type ConfirmPasswordCodeApiResponse = void;

export type VerifyEmailApiPayload = {
  code: number;
};
