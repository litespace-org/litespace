import { useApi } from "@/api";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useCallback } from "react";
import { MutationKey, QueryKey } from "@/constants";
import { OnError, OnSuccess } from "@/types/query";
import { IFawry } from "@litespace/types";

const getAddCardTokenUrlQueryKeys = [QueryKey.GetAddCardTokenUrl];

export function useGetAddCardUrl() {
  const api = useApi();

  const getAddCardTokenUrl = useCallback(
    () => api.fawry.getAddCardTokenUrl(),
    [api.fawry]
  );

  const query = useQuery({
    queryFn: getAddCardTokenUrl,
    queryKey: getAddCardTokenUrlQueryKeys,
  });

  return { query, keys: getAddCardTokenUrlQueryKeys };
}

const findCardTokensQueryKeys = [QueryKey.FindCardTokens];

export function useFindCardTokens() {
  const api = useApi();

  const findCardTokens = useCallback(
    () => api.fawry.findCardTokens(),
    [api.fawry]
  );

  const query = useQuery({
    queryFn: findCardTokens,
    queryKey: findCardTokensQueryKeys,
  });

  return { query, keys: findCardTokensQueryKeys };
}

export function useDeleteCardToken({
  onSuccess,
  onError,
}: {
  onSuccess?: OnSuccess<IFawry.DeleteCardTokenResponse>;
  onError?: OnError;
}) {
  const api = useApi();

  const deleteCardToken = useCallback(
    (payload: IFawry.DeleteCardTokenPayload) =>
      api.fawry.deleteCardToken(payload),
    [api.fawry]
  );

  return useMutation({
    mutationFn: deleteCardToken,
    mutationKey: [MutationKey.DeleteCardToken],
    onSuccess,
    onError,
  });
}

export function usePayWithCard({
  onSuccess,
  onError,
}: {
  onSuccess?: OnSuccess<IFawry.PayWithCardResponse>;
  onError?: OnError;
}) {
  const api = useApi();

  const payWithCard = useCallback(
    (payload: IFawry.PayWithCardPayload) => api.fawry.payWithCard(payload),
    [api.fawry]
  );

  return useMutation({
    mutationFn: payWithCard,
    mutationKey: [MutationKey.PayWithCard],
    onSuccess,
    onError,
  });
}

export function usePayWithEWallet({
  onSuccess,
  onError,
}: {
  onSuccess?: OnSuccess<IFawry.PayWithEWalletResponse>;
  onError?: OnError;
}) {
  const api = useApi();

  const payWithEWallet = useCallback(
    (payload: IFawry.PayWithEWalletPayload) =>
      api.fawry.payWithEWallet(payload),
    [api.fawry]
  );

  return useMutation({
    mutationFn: payWithEWallet,
    mutationKey: [MutationKey.PayWithEWallet],
    onSuccess,
    onError,
  });
}

export function usePayWithFawry({
  onSuccess,
  onError,
}: {
  onSuccess?: OnSuccess<IFawry.PayWithRefNumResponse>;
  onError?: OnError;
}) {
  const api = useApi();

  const payWithFawry = useCallback(
    (payload: IFawry.PayWithRefNumPayload) => api.fawry.payWithRefNum(payload),
    [api.fawry]
  );

  return useMutation({
    mutationFn: payWithFawry,
    mutationKey: [MutationKey.PayWithFawry],
    onSuccess,
    onError,
  });
}

export function useCancelUnpaidOrder({
  onSuccess,
  onError,
}: {
  onSuccess?: OnSuccess<IFawry.CancelUnpaidOrderResponse>;
  onError?: OnError;
}) {
  const api = useApi();

  const cancel = useCallback(
    (payload: IFawry.CancelUnpaidOrderPayload) =>
      api.fawry.cancelUnpaidOrder(payload),
    [api.fawry]
  );

  return useMutation({
    mutationFn: cancel,
    mutationKey: [MutationKey.CancelUnpaidOrder],
    onSuccess,
    onError,
  });
}

export function useGetPaymentStatus(transactionId: number) {
  const api = useApi();

  const keys = [QueryKey.GetPaymentStatus, transactionId];

  const getPaymentStatus = useCallback(
    () => api.fawry.getPaymentStatus({ transactionId }),
    [api.fawry, transactionId]
  );

  const query = useQuery({
    queryFn: getPaymentStatus,
    queryKey: keys,
  });

  return { query, keys };
}

export function useSyncPaymentStatus({
  onSuccess,
  onError,
}: {
  onSuccess?: OnSuccess<IFawry.SyncPaymentStatusResponse>;
  onError?: OnError;
}) {
  const api = useApi();

  const sync = useCallback(
    (payload: IFawry.SyncPaymentStatusPayload) =>
      api.fawry.syncPaymentStatus(payload),
    [api.fawry]
  );

  return useMutation({
    mutationFn: sync,
    mutationKey: [MutationKey.SyncPaymentStatus],
    onSuccess,
    onError,
  });
}
