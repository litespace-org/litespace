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
