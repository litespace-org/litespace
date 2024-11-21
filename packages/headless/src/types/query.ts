export type OnSuccess<T> = (result: T) => void;
export type OnError = (error: Error) => void;

export type BaseMutationPayload<T> = {
  onSuccess?: OnSuccess<T>;
  onError?: OnError;
};
