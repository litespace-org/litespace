import { Paginated, Void } from "@litespace/types";
import { useInfiniteQuery } from "@tanstack/react-query";
import { first, flatten, sum } from "lodash";
import { useCallback, useState, useMemo, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export function useReload() {
  const naviate = useNavigate();
  return useCallback(() => naviate(0), [naviate]);
}

export function usePaginationQuery<T>(
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

export function useRender() {
  const [open, setOpen] = useState<boolean>(false);
  const show = useCallback(() => setOpen(true), []);
  const hide = useCallback(() => setOpen(false), []);
  const toggle = useCallback(() => setOpen(!open), [open]);

  return {
    open,
    show,
    hide,
    toggle,
    setOpen,
  };
}

export function useInfinteScroll<T extends HTMLElement = HTMLElement>(
  more: Void,
  enabled: boolean
) {
  const target = useRef<T>(null);

  const observer = useMemo(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = first(entries);
        if (entry?.isIntersecting && enabled) more();
      },
      { threshold: 0.5 }
    );
    if (target.current) observer.observe(target.current);
    return observer;
  }, [enabled, more]);

  useEffect(() => {
    const ref = target.current;
    return () => {
      if (ref) return observer.unobserve(ref);
    };
  }, [observer]);

  return { target };
}
