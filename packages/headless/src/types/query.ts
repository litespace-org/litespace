export type OnSuccess<T> = (result: T) => void;
export type OnError = (error: unknown) => void;

export type BaseMutationPayload<T> = {
  onSuccess?: OnSuccess<T>;
  onError?: OnError;
};
