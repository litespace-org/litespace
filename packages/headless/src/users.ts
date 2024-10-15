import { useAtlas } from "@/atlas";
import { usePaginate, UsePaginateResult } from "@/pagination";
import { IFilter, IUser } from "@litespace/types";
import { useCallback } from "react";

export function useUsers(): UsePaginateResult<IUser.Self> {
  const atlas = useAtlas();

  const findUsers = useCallback(
    ({ page, size }: IFilter.Pagination) => atlas.user.find({ page, size }),
    [atlas.user]
  );

  return usePaginate(findUsers, ["find-users"]);
}
