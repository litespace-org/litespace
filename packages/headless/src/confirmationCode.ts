import { OnError, OnSuccess } from "@/types/query";
import { useApi } from "@/api";
import { useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { MutationKey } from "@/constants";
import { IConfirmationCode } from "@litespace/types";

export function useSendPhoneCode({
  onSuccess,
  onError,
}: {
  onSuccess: OnSuccess<void>;
  onError: OnError;
}) {
  const api = useApi();

  const sendPhoneCode = useCallback(
    (payload: IConfirmationCode.SendVerifyPhoneCodePayload) =>
      api.confirmationCode.sendVerifyPhoneCode(payload),
    [api]
  );

  return useMutation({
    onSuccess,
    onError,
    mutationFn: sendPhoneCode,
    mutationKey: [MutationKey.SendPhoneCode],
  });
}

export function useVerifyPhoneCode({
  onSuccess,
  onError,
}: {
  onSuccess: OnSuccess<void>;
  onError: OnError;
}) {
  const api = useApi();

  const verifyPhoneCode = useCallback(
    (payload: IConfirmationCode.VerifyPhoneCodePayload) =>
      api.confirmationCode.verifyPhoneCode(payload),
    [api]
  );

  return useMutation({
    onSuccess,
    onError,
    mutationFn: verifyPhoneCode,
    mutationKey: [MutationKey.VerifyPhoneCode],
  });
}

export function useSendForgetPasswordCode({
  onSuccess,
  onError,
}: {
  onError?: OnError;
  onSuccess?: OnSuccess<void>;
}) {
  const api = useApi();

  const sendCode = useCallback(
    (payload: IConfirmationCode.SendForgetPasswordEmailPayload) => {
      return api.confirmationCode.sendForgetPasswordCode(payload);
    },
    [api.confirmationCode]
  );

  return useMutation({
    onError,
    onSuccess,
    mutationFn: sendCode,
    mutationKey: [MutationKey.SendForgetPasswordCode],
  });
}

export function useConfirmForgetPasswordCode({
  onError,
  onSuccess,
}: {
  onError?: OnError;
  onSuccess?: OnSuccess<void>;
}) {
  const api = useApi();

  const send = useCallback(
    (payload: IConfirmationCode.ConfirmForgetPasswordCodePayload) => {
      return api.confirmationCode.confirmForgetPasswordCode(payload);
    },
    [api.confirmationCode]
  );

  return useMutation({
    onError,
    onSuccess,
    mutationFn: send,
    mutationKey: [MutationKey.SendForgetPasswordCode],
  });
}

export function useConfirmVerificationEmailCode({
  onSuccess,
  onError,
}: {
  onSuccess: OnSuccess<void>;
  onError: OnError;
}) {
  const api = useApi();

  const confirm = useCallback(
    (code: number) => {
      return api.confirmationCode.confirmVerificationEmailCode({ code });
    },
    [api.confirmationCode]
  );

  return useMutation({
    onSuccess,
    onError,
    mutationFn: confirm,
    mutationKey: [MutationKey.VerifyEmail],
  });
}

export function useSendVerificationEmailCode({
  onSuccess,
  onError,
}: {
  onSuccess?: OnSuccess<void>;
  onError?: OnError;
}) {
  const api = useApi();

  const send = useCallback(() => {
    return api.confirmationCode.sendVerificationEmailCode();
  }, [api.confirmationCode]);

  return useMutation({
    onError,
    onSuccess,
    mutationFn: send,
    mutationKey: [MutationKey.SendVerifyEmailCode],
  });
}
