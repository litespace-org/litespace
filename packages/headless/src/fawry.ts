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
