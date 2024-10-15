import {
  keepPreviousData,
  useQuery,
  UseQueryResult,
} from "@tanstack/react-query";
import { useAtlas } from "@/atlas";
import { useCallback, useMemo, useState } from "react";
import { IUser } from "@litespace/types";

const SIZE = 10;

export function useUsers() {
  const atlas = useAtlas();
  const [page, setPage] = useState<number>(1);
  const findUsers = useCallback(
    () => atlas.user.find({ page: page, size: SIZE }),
    [atlas.user, page]
  );

  const query: UseQueryResult<IUser.FindUsersApiResponse> = useQuery({
    queryFn: findUsers,
    queryKey: ["find-all-users", page],
    placeholderData: keepPreviousData,
  });

  const totalPages = useMemo(
    () => (query.data ? Math.ceil(query.data.total / SIZE) : 0),
    [query.data]
  );

  const next = useCallback(() => {
    if (page >= totalPages) return;
    setPage((prev) => prev + 1);
  }, [page, totalPages]);

  const prev = useCallback(() => {
    if (page <= 1) return;
    setPage((prev) => prev - 1);
  }, [page]);

  const goto = useCallback(
    (pageNumber: number) => {
      if (pageNumber < 1 || pageNumber > totalPages) return;
      setPage(pageNumber);
    },
    [totalPages]
  );

  return { query, next, prev, goto, page, totalPages };
}
