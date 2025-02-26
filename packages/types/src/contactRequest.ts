export type Self = {
  id: number;
  name: string;
  phone: string;
  title: string;
  message: string;
  createdAt: string;
};

export type Row = {
  id: number;
  name: string;
  phone: string;
  title: string;
  message: string;
  created_at: Date;
};

export type CreatePayload = {
  name: string;
  phone: string;
  title: string;
  message: string;
};

export type CreateContactRequestApiPayload = CreatePayload;
export type CreateContactRequestApiResponse = void;
