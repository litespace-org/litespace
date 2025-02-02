import { ResponseError } from "@litespace/utils";

export type OnSuccess<T> = (result: T) => void;
export type OnError = (error: ResponseError) => void;

export type BaseMutationPayload<T> = {
  onSuccess?: OnSuccess<T>;
  onError?: OnError;
};
