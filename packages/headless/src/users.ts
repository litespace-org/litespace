import { useAtlas } from "@/atlas";
import { usePaginate, UsePaginateResult } from "@/pagination";
import { IFilter, IUser, Void } from "@litespace/types";
import { useMutation, useQuery, UseQueryResult } from "@tanstack/react-query";
import { useCallback } from "react";
import { QueryKey } from "./constants";

export function useUsers(
  filter?: Omit<IUser.FindUsersApiQuery, "page" | "size">
): UsePaginateResult<IUser.Self> {
  const atlas = useAtlas();

  const findUsers = useCallback(
    ({ page, size }: IFilter.Pagination) =>
      atlas.user.find({ page, size, ...filter }),
    [atlas.user, filter]
  );

  return usePaginate(findUsers, ["find-users", filter]);
}

export function useFindUserById(
  id: string | number
): UseQueryResult<IUser.Self> {
  const atlas = useAtlas();

  const findUserById = useCallback(
    async () => await atlas.user.findById(id),
    [atlas.user, id]
  );

  return useQuery({
    queryKey: [QueryKey.FindUserById, id],
    queryFn: findUserById,
  });
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
