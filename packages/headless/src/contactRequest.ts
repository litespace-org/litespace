import { OnError, OnSuccess } from "@/types/query";
import { useAtlas } from "@/atlas";
import { useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { MutationKey } from "@/constants";
import { IContactRequest } from "@litespace/types";

export function useCreateContactRequest({
  onSuccess,
  onError,
}: {
  onSuccess: OnSuccess<void>;
  onError: OnError;
}) {
  const atlas = useAtlas();

  const createContactRequest = useCallback(
    async (payload: IContactRequest.CreateContactRequestApiPayload) => {
      return await atlas.contactRequest.create(payload);
    },
    [atlas.contactRequest]
  );

  return useMutation({
    mutationFn: createContactRequest,
    mutationKey: [MutationKey.CreateContactRequest],
    onSuccess,
    onError,
  });
}
