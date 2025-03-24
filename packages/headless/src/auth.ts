import { useCallback } from "react";
import { useApi } from "@/api/index";
import { IUser } from "@litespace/types";
import { useMutation } from "@tanstack/react-query";
import { MutationKey } from "@/constants";
import { OnError, OnSuccess } from "@/types/query";

export type OnResetPasswordSuccess = (
  response: IUser.ResetPasswordApiResponse
) => void;

export function useForgetPassword({
  onSuccess,
  onError,
}: {
  onSuccess?: OnSuccess<void>;
  onError?: OnError;
}) {
  const atlas = useApi();
  const forgetPassword = useCallback(
    async (credentials: IUser.ForgetPasswordApiPayload) => {
      return await atlas.auth.forgetPassword(credentials);
    },
    [atlas.auth]
  );

  return useMutation({
    onSuccess,
    onError,
    mutationFn: forgetPassword,
    mutationKey: [MutationKey.ForgetPassword],
  });
}

export function useResetPassword({
  onSuccess,
  onError,
}: {
  onSuccess: OnResetPasswordSuccess;
  onError: OnError;
}) {
  const atlas = useApi();

  const resetPassword = useCallback(
    async (credentials: IUser.ResetPasswordApiPayload) => {
      return await atlas.auth.resetPassword(credentials);
    },
    [atlas.auth]
  );

  return useMutation({
    onSuccess,
    onError,
    mutationFn: resetPassword,
    mutationKey: [MutationKey.ResetPassword],
  });
}

export function useVerifyEmail({
  onSuccess,
  onError,
}: {
  onSuccess: OnSuccess<void>;
  onError: OnError;
}) {
  const atlas = useApi();
  const verifyEmail = useCallback(
    (token: string) => {
      return atlas.auth.verifyEmail(token);
    },
    [atlas.auth]
  );

  return useMutation({
    onSuccess,
    onError,
    mutationFn: verifyEmail,
    mutationKey: [MutationKey.VerifyEmail],
  });
}

export function useSendVerifyEmail({
  onSuccess,
  onError,
}: {
  onSuccess: OnSuccess<void>;
  onError: OnError;
}) {
  const atlas = useApi();
  const verifyEmail = useCallback(
    (callbackUrl: string) => {
      return atlas.auth.sendVerifyEmail(callbackUrl);
    },
    [atlas.auth]
  );

  return useMutation({
    onSuccess,
    onError,
    mutationFn: verifyEmail,
    mutationKey: [MutationKey.ReVerifyEmail],
  });
}
