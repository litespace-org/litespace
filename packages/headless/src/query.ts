import {
  InfiniteData,
  UseInfiniteQueryResult,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { Paginated, Void } from "@litespace/types";
import { first, flatten, sum } from "lodash";
import { useCallback, useMemo } from "react";

export function useInvalidateQuery() {
  const client = useQueryClient();
  return useCallback(
    (keys: unknown[]) => client.invalidateQueries({ queryKey: keys }),
    [client]
  );
}

export type UseInfinitePaginationQueryResult<T> = {
  list: T[] | null;
  query: UseInfiniteQueryResult<InfiniteData<Paginated<T>, unknown>, Error>;
  more: Void;
  hasMore: boolean;
  keys: unknown[];
};

export type InfiniteQueryHandler<T> = ({
  page,
}: {
  page: number;
}) => Promise<Paginated<T>>;

export function useInfinitePaginationQuery<T, K>(
  handler: InfiniteQueryHandler<T>,
  keys: K[],
  enabled?: boolean
): UseInfinitePaginationQueryResult<T> {
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
    queryFn: ({ pageParam }) => handler({ page: pageParam }),
    queryKey: keys,
    initialPageParam: 1,
    getNextPageParam,
    enabled,
  });

  const list = useMemo(() => {
    if (!query.data) return null;
    return flatten(query.data.pages.map((page) => page.list));
  }, [query.data]);

  const total = useMemo(() => {
    return first(query.data?.pages)?.total || 0;
  }, [query.data?.pages]);

  const more = useCallback(() => {
    query.fetchNextPage();
  }, [query]);

  const hasMore: boolean = useMemo(() => {
    return list?.length !== total;
  }, [list?.length, total]);

  return { query, list, more, hasMore, keys };
}
