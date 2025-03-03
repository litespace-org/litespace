import {
  InfiniteData,
  UseInfiniteQueryResult,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { Paginated, Void } from "@litespace/types";
import { flatten, sum } from "lodash";
import { useCallback, useMemo } from "react";

export function useInvalidateQuery() {
  const client = useQueryClient();
  return useCallback(
    (keys: (string | number)[]) => client.invalidateQueries({ queryKey: keys }),
    [client]
  );
}

export type UseInfinitePaginationQueryResult<T> = {
  list: T[] | null;
  query: UseInfiniteQueryResult<InfiniteData<Paginated<T>, unknown>, Error>;
  more: Void;
};

export type InfiniteQueryHandler<T> = ({
  pageParam,
}: {
  pageParam: number;
}) => Promise<Paginated<T>>;

export function useInfinitePaginationQuery<T, K>(
  handler: InfiniteQueryHandler<T>,
  key: K[],
  enabled?: boolean
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
    enabled,
  });

  const list = useMemo(() => {
    if (!query.data) return null;
    return flatten(query.data.pages.map((page) => page.list));
  }, [query.data]);

  const more = useCallback(() => {
    query.fetchNextPage();
  }, [query]);

  const thereAreMore: boolean = useMemo(() => {
    return list?.length !== query.data?.pages[0].total;
  }, [query.data, list?.length]);

  return { query, list, more, thereAreMore };
}
