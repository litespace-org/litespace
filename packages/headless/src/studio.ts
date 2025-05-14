import { useApi } from "@/api";
import { IFilter } from "@litespace/types";
import { useQuery } from "@tanstack/react-query";
import { useCallback } from "react";
import { QueryKey } from "@/constants";

export function useFindStudios(query?: IFilter.Pagination) {
  const api = useApi();

  const findStudios = useCallback(() => {
    return api.user.findStudios(query);
  }, [api.user, query]);

  return useQuery({
    queryFn: findStudios,
    queryKey: [QueryKey.FindStudios],
  });
}
