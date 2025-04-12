import { Api } from "telegram";

export type ResolvePhonePayload = {
  phone: string;
};

export type ResolvePhoneResponse = Api.TypeUser | null;
