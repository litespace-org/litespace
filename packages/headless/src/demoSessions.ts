import { useApi } from "@/api/index";
import { useCallback } from "react";
import { useExtendedQuery } from "@/query";

export function useFindDemoSession(id: number) {
  const api = useApi();

  const findDemoSessionById = useCallback(async () => {
    if (!id) return null;
    const result = await api.demoSession.find({ ids: [id] });
    return result.list[0];
  }, [api.demoSession, id]);

  return useExtendedQuery({
    queryFn: findDemoSessionById,
    queryKey: ["FindDemoSession", id],
    enabled: !!id,
  });
}
