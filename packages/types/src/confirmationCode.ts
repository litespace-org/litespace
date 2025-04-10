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

export type CreatePayload = {
  userId?: number | null;
  purpose: Purpose;
  code: number;
  expiresAt: string;
};

export type FindPayload = {
  code: number;
  purpose?: Purpose;
};

export type DeleteByCodeAndPurpose = {
  code: number;
  purpose?: number;
};
