import { useAtlas } from "@/atlas";
import { usePaginate, UsePaginateResult } from "@/pagination";
import { IFilter, IUser, Void } from "@litespace/types";
import { useMutation } from "@tanstack/react-query";
import { useCallback } from "react";

export function useUsers(): UsePaginateResult<IUser.Self> {
  const atlas = useAtlas();

  const findUsers = useCallback(
    ({ page, size }: IFilter.Pagination) => atlas.user.find({ page, size }),
    [atlas.user]
  );

  return usePaginate(findUsers, ["find-users"]);
}

export function useCreateUser({
  onSuccess,
  onError,
}: {
  onSuccess: Void;
  onError: (error: Error) => void;
}) {
  const atlas = useAtlas();
  const createUser = useCallback(
    (payload: IUser.CreateApiPayload) => atlas.user.create(payload),
    [atlas.user]
  );

  return useMutation({
    mutationFn: createUser,
    mutationKey: ["create-user"],
    onSuccess,
    onError,
  });
}
