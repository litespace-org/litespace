import { IRoom } from "@litespace/types";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { useCallback } from "react";
import { useAtlas } from "@/atlas/index";

export function useFindCallRoomById(
  callId: number | null
): UseQueryResult<IRoom.FindCallRoomApiResponse | null, Error> {
  const atlas = useAtlas();

  const findCallRoom = useCallback(async () => {
    if (!callId) return null;
    return await atlas.chat.findCallRoom(callId);
  }, [atlas.chat, callId]);

  return useQuery({
    queryFn: findCallRoom,
    queryKey: ["find-call-room"],
  });
}
