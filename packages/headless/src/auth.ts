import { useCallback } from "react";
import { useApi } from "@/api/index";
import { IConfirmationCode, IUser } from "@litespace/types";
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
  const api = useApi();
  const forgetPassword = useCallback(
    async (credentials: IUser.ForgetPasswordApiPayload) => {
      return await api.auth.forgetPassword(credentials);
    },
    [api.auth]
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
  const api = useApi();

  const resetPassword = useCallback(
    async (credentials: IUser.ResetPasswordApiPayload) => {
      return await api.auth.resetPassword(credentials);
    },
    [api.auth]
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
  const api = useApi();
  const verifyEmail = useCallback(
    (token: string) => {
      return api.auth.verifyEmail(token);
    },
    [api.auth]
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
  const api = useApi();
  const verifyEmail = useCallback(
    (callbackUrl: string) => {
      return api.auth.sendVerifyEmail(callbackUrl);
    },
    [api.auth]
  );

  return useMutation({
    onSuccess,
    onError,
    mutationFn: verifyEmail,
    mutationKey: [MutationKey.ReVerifyEmail],
  });
}

export function useSendVerifyEmailCode({ onError }: { onError: OnError }) {
  const api = useApi();
  const sendVerifyEmail = useCallback(() => {
    return api.confirmationCode.sendVerificationEmailCode();
  }, [api.confirmationCode]);

  return useMutation({
    onError,
    mutationFn: sendVerifyEmail,
    mutationKey: [MutationKey.ReVerifyEmail],
  });
}

export function useConfirmVerifyEmailByCode({
  onSuccess,
  onError,
}: {
  onSuccess: OnSuccess<void>;
  onError: OnError;
}) {
  const api = useApi();
  const verifyEmail = useCallback(
    (code: number) => {
      return api.confirmationCode.confirmVerificationEmailCode({ code });
    },
    [api.confirmationCode]
  );

  return useMutation({
    onSuccess,
    onError,
    mutationFn: verifyEmail,
    mutationKey: [MutationKey.VerifyEmail],
  });
}

export function useRefreshAuthToken({
  onSuccess,
}: {
  onSuccess?: OnSuccess<IUser.RefreshAuthTokenApiResponse>;
}) {
  const api = useApi();
  const refresh = useCallback(() => api.auth.refreshToken(), [api.auth]);

  return useMutation({
    mutationFn: refresh,
    mutationKey: [MutationKey.RefreshAuthToken],
    onSuccess,
  });
}

export function useSendForgetPasswordCode({ onError }: { onError: OnError }) {
  const api = useApi();

  const sendCode = useCallback(
    (payload: IConfirmationCode.SendForgetPasswordEmailPayload) => {
      return api.confirmationCode.sendForgetPasswordCode(payload);
    },
    [api.confirmationCode]
  );

  return useMutation({
    mutationFn: sendCode,
    mutationKey: [MutationKey.SendForgetPasswordCode],
    onError,
  });
}

export function useResetPasswordByCode({
  onError,
  onSuccess,
}: {
  onError: OnError;
  onSuccess: OnSuccess<void>;
}) {
  const api = useApi();

  const sendCode = useCallback(
    (payload: IConfirmationCode.ConfirmForgetPasswordCodePayload) => {
      return api.confirmationCode.resetPassword(payload);
    },
    [api.confirmationCode]
  );

  return useMutation({
    mutationFn: sendCode,
    mutationKey: [MutationKey.SendForgetPasswordCode],
    onError,
    onSuccess,
  });
}
