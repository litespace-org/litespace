import { IFilter, Paginated, Void } from "@litespace/types";
import {
  keepPreviousData,
  useQuery,
  UseQueryResult,
} from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";

export type UsePaginateResult<T> = {
  query: UseQueryResult<Paginated<T>, Error>;
  next: Void;
  prev: Void;
  goto: (pageNumber: number) => void;
  page: number;
  totalPages: number;
};

const SIZE = 10;

export function usePaginate<T, K>(
  callback: ({ page, size }: IFilter.Pagination) => Promise<Paginated<T>>,
  key: K[]
): UsePaginateResult<T> {
  const [page, setPage] = useState<number>(1);
  const find = useCallback(
    () => callback({ page, size: SIZE }),
    [callback, page]
  );
  const query = useQuery({
    queryFn: find,
    queryKey: [...key, page],
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
