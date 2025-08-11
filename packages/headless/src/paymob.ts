import { useCallback } from "react";
import { useApi } from "@/api";
import { OnError } from "@/types/query";
import { IPaymob } from "@litespace/types";
import { useMutation } from "@tanstack/react-query";

export function useCreateCheckoutUrl({
  onSuccess,
  onError,
}: {
  onSuccess: (response: IPaymob.CreateCheckoutUrlApiResponse) => void;
  onError: OnError;
}) {
  const api = useApi();

  const createCheckoutUrl = useCallback(
    async (payload: IPaymob.CreateCheckoutUrlApiPayload) => {
      return api.paymob.createCheckoutUrl(payload);
    },
    [api.paymob]
  );

  return useMutation({
    mutationFn: createCheckoutUrl,
    onSuccess,
    onError,
  });
}
