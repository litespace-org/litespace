import { IUser } from ".";

export type Self = {
  id: number;
  raterId: number;
  rateeId: number;
  value: number;
  feedback: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Populated = {
  id: number;
  rater: { id: number; name: IUser.Self["name"]; image: IUser.Self["image"] };
  ratee: { id: number; name: IUser.Self["name"]; image: IUser.Self["image"] };
  value: number;
  feedback: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PopulatedRow = {
  id: number;
  raterId: number;
  raterName: IUser.Row["name"];
  raterImage: string | null;
  rateeId: number;
  rateeName: IUser.Row["name"];
  rateeImage: string | null;
  value: number;
  feedback: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type Row = {
  id: number;
  rater_id: number;
  ratee_id: number;
  value: number;
  feedback: string | null;
  created_at: Date;
  updated_at: Date;
};

export type CreatePayload = {
  raterId: number;
  rateeId: number;
  value: number;
  feedback: string | null;
};

export type UpdatePayload = {
  value?: number;
  feedback?: string;
};

export type CreateApiPayload = {
  rateeId: number;
  value: number;
  feedback: string | null;
};

export type UpdateApiPayload = UpdatePayload;
