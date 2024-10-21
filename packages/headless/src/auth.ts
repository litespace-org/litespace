import { useCallback } from "react";
import { useAtlas } from "@/atlas/index";
import { IUser, Void } from "@litespace/types";
import { useMutation } from "@tanstack/react-query";
import { MutationKey } from "./constants";

export type OnForgetPasswordSuccess = Void;
export type OnResetPasswordSuccess = (
  response: IUser.ResetPasswordApiResponse
) => void;
export type OnError = (error: Error) => void;

export function useForgetPassword({
  onSuccess,
  onError,
}: {
  onSuccess: OnForgetPasswordSuccess;
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
    []
  );

  return useMutation({
    onSuccess,
    onError,
    mutationFn: resetPassword,
    mutationKey: [MutationKey.ResetPassword],
  });
}
