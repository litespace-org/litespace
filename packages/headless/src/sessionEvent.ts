import { useApi } from "@/api";
import { useCallback } from "react";
import { QueryKey } from "@/constants";
import { usePaginate } from "@/pagination";
import { ISessionEvent } from "@litespace/types";

export function useFindSessionEvents() {
  const api = useApi();

  const findSessionMembers = useCallback(
    async ({ page, size }: ISessionEvent.FindApiQuery) =>
      await api.sessionEvent.find({ page, size }),
    [api.sessionEvent]
  );

  return usePaginate(findSessionMembers, [QueryKey.FindSessionMembers]);
}
