import {
  InfiniteData,
  UseInfiniteQueryResult,
  useQueryClient,
} from "@tanstack/react-query";
import { Paginated, Void } from "@litespace/types";
import { useInfiniteQuery } from "@tanstack/react-query";
import { flatten, sum } from "lodash";
import { useCallback, useMemo } from "react";

export function useInvalidateQuery() {
  const client = useQueryClient();
  return useCallback(
    (keys: (string | number)[]) => client.invalidateQueries({ queryKey: keys }),
    []
  );
}

export type UseInfinitePaginationQueryResult<T> = {
  list: T[] | null;
  query: UseInfiniteQueryResult<InfiniteData<Paginated<T>, unknown>, Error>;
  more: Void;
};

export function useInfinitePaginationQuery<T>(
  handler: ({ pageParam }: { pageParam: number }) => Promise<Paginated<T>>,
  key: string[]
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
