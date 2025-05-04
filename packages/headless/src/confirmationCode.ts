import { OnError, OnSuccess } from "@/types/query";
import { useApi } from "@/api";
import { useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { MutationKey } from "@/constants";
import { IConfirmationCode } from "@litespace/types";

export function useSendEmailConfrimationCode({
  onSuccess,
  onError,
}: {
  onSuccess: OnSuccess<IConfirmationCode.SendEmailConfirmationCodeResponse>;
  onError: OnError;
}) {
  const api = useApi();

  const sendVerifyEmail = useCallback(
    async (payload: IConfirmationCode.SendEmailConfirmationCodePayload) => {
      return await api.confirmationCode.sendEmailConfirmationCode(payload);
    },
    [api.confirmationCode]
  );

  return useMutation({
    mutationFn: sendVerifyEmail,
    mutationKey: [MutationKey.SendVerifyEmail],
    onSuccess,
    onError,
  });
}

export function useConfirmEmailByCode({
  onSuccess,
  onError,
}: {
  onSuccess: OnSuccess<IConfirmationCode.ConfirmEmailByCodeResponse>;
  onError: OnError;
}) {
  const api = useApi();

  const confirmEmail = useCallback(
    async (payload: IConfirmationCode.ConfirmEmailByCodePayload) => {
      return await api.confirmationCode.confirmEmailWithCode(payload);
    },
    [api.confirmationCode]
  );

  return useMutation({
    mutationFn: confirmEmail,
    mutationKey: [MutationKey.ConfirmEmail],
    onSuccess,
    onError,
  });
}
