import { useApi } from "@/api";
import { usePaginate, UsePaginateResult } from "@/pagination";
import { IFilter, IUser, Void } from "@litespace/types";
import { useMutation, useQuery, UseQueryResult } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { QueryKey } from "@/constants";

export function useUsers(
  filter?: Omit<IUser.FindUsersApiQuery, "page" | "size">
): UsePaginateResult<IUser.Self> {
  const api = useApi();

  const findUsers = useCallback(
    ({ page, size }: IFilter.Pagination) =>
      api.user.find({ page, size, ...filter }),
    [api.user, filter]
  );

  return usePaginate(findUsers, ["find-users", filter]);
}

export function useFindUserById(id: string | number): {
  query: UseQueryResult<IUser.Self>;
  keys: unknown[];
} {
  const api = useApi();

  const findUserById = useCallback(
    async () => await api.user.findById(id),
    [api.user, id]
  );

  const keys = useMemo(() => [QueryKey.FindUserById, id], [id]);

  const query = useQuery({
    queryKey: keys,
    queryFn: findUserById,
  });

  return { query, keys };
}

export function useCreateUser({
  onSuccess,
  onError,
}: {
  onSuccess: Void;
  onError: (error: Error) => void;
}) {
  const api = useApi();
  const createUser = useCallback(
    (payload: IUser.CreateApiPayload) => api.user.create(payload),
    [api.user]
  );

  return useMutation({
    mutationFn: createUser,
    mutationKey: ["create-user"],
    onSuccess,
    onError,
  });
}
