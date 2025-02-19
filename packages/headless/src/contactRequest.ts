import { OnError, OnSuccess } from "@/types/query";
import { useAtlas } from "@/atlas";
import { useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { MutationKey } from "@/constants";

export function useCreateContactRequest({
  onSuccess,
  onError,
}: {
  onSuccess: OnSuccess<void>;
  onError: OnError;
}) {
  const atlas = useAtlas();

  const createContactRequest = useCallback(
    async ({
      name,
      email,
      title,
      message,
    }: {
      name: string;
      email: string;
      title: string;
      message: string;
    }) => {
      return await atlas.contactRequest.create({
        name,
        email,
        title,
        message,
      });
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
