export enum Type {
  ForgetPassword = "forget-password",
  VerifyEmail = "verify-email",
}

export type Row = {
  id: number;
  user_id: number;
  token_hash: string;
  used: boolean;
  type: Type;
  expires_at: Date;
  created_at: Date;
  updated_at: Date;
};

export type Self = {
  id: number;
  userId: number;
  hash: string;
  used: boolean;
  type: Type;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
};

export type Column = keyof Row;

export type Field = keyof Self;

export type CreatePayload = {
  userId: number;
  expiresAt: Date;
  hash: string;
  type: Type;
};

export type AuthTokenEmail = {
  type: Type.VerifyEmail | Type.ForgetPassword;
  user: number;
};

export type CodeEmail = {
  type: Type.VerifyEmail | Type.ForgetPassword;
  user: number;
};

export type VerifyEmailJwtPayload = {
  type: Type.VerifyEmail;
  user: number;
};

export type ResetPasswordJwtPayload = {
  type: Type.ForgetPassword;
  user: number;
};
