import { IFilter, Paginated, Void } from "@litespace/types";
import { keepPreviousData } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";
import { usePageSize } from "@/config";
import { UseExtendedQueryResult, useExtendedQuery } from "@/query";

export type UsePaginateResult<T> = {
  query: UseExtendedQueryResult<Paginated<T>, Error>;
  next: Void;
  prev: Void;
  goto: (pageNumber: number) => void;
  page: number;
  totalPages: number;
};

export function usePaginate<T, K>(
  callback: ({ page, size }: IFilter.Pagination) => Promise<Paginated<T>>,
  keys: K[]
): UsePaginateResult<T> {
  const [page, setPage] = useState<number>(1);
  const pageSize = usePageSize();

  const find = useCallback(
    () => callback({ page, size: pageSize.value }),
    [callback, page, pageSize.value]
  );

  const query = useExtendedQuery({
    queryFn: find,
    queryKey: [...keys, page, pageSize.value],
    placeholderData: keepPreviousData,
  });

  const totalPages = useMemo(
    () => (query.data ? Math.ceil(query.data.total / pageSize.value) : 0),
    [pageSize.value, query.data]
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
