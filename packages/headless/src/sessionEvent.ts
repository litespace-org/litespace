import { useApi } from "@/api";
import { useCallback } from "react";
import { QueryKey } from "@/constants";
import { usePaginate } from "@/pagination";
import { ISession, ISessionEvent } from "@litespace/types";
import { useQuery } from "@tanstack/react-query";

export function useFindSessionEvents() {
  const api = useApi();

  const findSessionMembers = useCallback(
    async ({ page, size }: ISessionEvent.FindApiQuery) =>
      await api.sessionEvent.find({ page, size }),
    [api.sessionEvent]
  );

  return usePaginate(findSessionMembers, [QueryKey.FindSessionMembers]);
}

export function useFindSessionEventsByLessonId(sessionId: ISession.Id) {
  const api = useApi();

  const findBySessionId = useCallback(
    async () => await api.sessionEvent.findBySessionId({ sessionId }),
    [api.sessionEvent, sessionId]
  );

  return useQuery({
    queryFn: findBySessionId,
    queryKey: [QueryKey.FindEventsByLessonId, sessionId],
  });
}
