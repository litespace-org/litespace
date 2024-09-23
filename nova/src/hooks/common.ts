import { Paginated } from "@litespace/types";
import { useInfiniteQuery } from "@tanstack/react-query";
import { flatten, sum } from "lodash";
import { useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";

export function useReload() {
  const naviate = useNavigate();
  return useCallback(() => naviate(0), [naviate]);
}

export function usePaginationQuery<T>(
  handler: ({ pageParam }: { pageParam: number }) => Promise<Paginated<T>>,
  key: (string | number | null)[]
) {
  const getNextPageParam = useCallback(
    (last: Paginated<T>, all: Paginated<T>[], lastPageParam: number) => {
      const page = lastPageParam;
      const total = sum(all.map((page) => page.list.length));
      if (total >= last.total) return null;
      return page + 1;
    },
    []
  );
  const query = useInfiniteQuery({
    queryFn: handler,
    queryKey: key,
    initialPageParam: 1,
    getNextPageParam,
  });

  const list = useMemo(() => {
    if (!query.data) return null;
    return flatten(query.data.pages.map((page) => page.list));
  }, [query.data]);

  const more = useCallback(() => {
    query.fetchNextPage();
  }, [query]);

  return { query, list, more };
}
