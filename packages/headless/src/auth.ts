import { useCallback } from "react";
import { useAtlas } from "@/atlas/index";
import { IUser, Void } from "@litespace/types";
import { useMutation } from "@tanstack/react-query";
import { MutationKey } from "@/constants";

export type OnSuccess = Void;
export type OnResetPasswordSuccess = (
  response: IUser.ResetPasswordApiResponse
) => void;
export type OnError = (error: Error) => void;

export function useForgetPassword({
  onSuccess,
  onError,
}: {
  onSuccess: OnSuccess;
  onError: OnError;
}) {
  const atlas = useAtlas();
  const forgetPassword = useCallback(
    async (credentials: IUser.ForegetPasswordApiPayload) => {
      return atlas.auth.forgotPassword(credentials);
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
  const atlas = useAtlas();

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
  onSuccess: OnSuccess;
  onError: OnError;
}) {
  const atlas = useAtlas();
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

export function useReVerifyEmail({
  onSuccess,
  onError,
}: {
  onSuccess: OnSuccess;
  onError: OnError;
}) {
  const atlas = useAtlas();
  const verifyEmail = useCallback(
    (callbackUrl: string) => {
      return atlas.auth.reVerifyEmail(callbackUrl);
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
