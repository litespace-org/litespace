export type Self = {
  id: number;
  email: string;
  accountId: string;
  clientId: string;
  clientSecret: string;
  remainingApiCalls: number;
  createdAt: string;
  updatedAt: string;
};

export type Row = {
  id: number;
  email: string;
  account_id: string;
  client_id: string;
  client_secret: string;
  remaining_api_calls: number;
  created_at: Date;
  updated_at: Date;
};

export type CreatePayload = {
  email: string;
  accountId: string;
  clientId: string;
  clientSecret: string;
};

export type UpdatePayload = Partial<{
  accountId: string;
  clientId: string;
  clientSecret: string;
}>;
