import { ISession } from "@litespace/types";
import { useApi } from "@/api";
import { useCallback } from "react";
import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { QueryKey } from "@/constants";

/**
 * retrieve the current in-members of a specific session
 */
export function useFindSessionMembers(
  sessionId: ISession.Id
): UseQueryResult<ISession.FindSessionMembersApiResponse> {
  const api = useApi();

  const findSessionMembers = useCallback(
    async () => await api.session.findMembers(sessionId),
    [api.session, sessionId]
  );

  return useQuery({
    queryFn: findSessionMembers,
    queryKey: [QueryKey.FindSessionMembers, sessionId],
  });
}
