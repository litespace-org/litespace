import { useAtlas } from "@/atlas";
import { IRoom, Void } from "@litespace/types";
import { useCallback } from "react";
import {
  useInfinitePaginationQuery,
  UseInfinitePaginationQueryResult,
} from "@/query";
import { MutationKey, QueryKey } from "@/constants";
import { useMutation, useQuery, UseQueryResult } from "@tanstack/react-query";

type OnSuccess = Void;
type OnError = (err: Error) => void;

export function useFindRoomMembers(
  roomId: number | null
): UseQueryResult<IRoom.FindRoomMembersApiResponse, Error> {
  const atlas = useAtlas();
  const findRoomMembers = useCallback(async () => {
    if (!roomId) return [];
    return await atlas.chat.findRoomMembers(roomId);
  }, [atlas.chat, roomId]);

  return useQuery({
    queryFn: findRoomMembers,
    queryKey: [QueryKey.FindRoomMembers, roomId],
    enabled: !!roomId,
  });
}

export function useFindUserRooms(
  userId?: number,
  payload?: IRoom.FindUserRoomsApiQuery
): UseInfinitePaginationQueryResult<IRoom.FindUserRoomsApiRecord> {
  const atlas = useAtlas();
  const findUserRooms = useCallback(
    async ({ pageParam }: { pageParam: number }) => {
      if (!userId) return { list: [], total: 0 };
      return await atlas.chat.findRooms(userId, {
        page: pageParam,
        ...payload,
      });
    },
    [atlas.chat, userId, payload]
  );

  return useInfinitePaginationQuery(findUserRooms, [
    QueryKey.FindUserRooms,
    payload,
  ]);
}

export function useUpdateRoom({
  onSuccess,
  onError,
}: {
  onSuccess?: OnSuccess;
  onError?: OnError;
}) {
  const atlas = useAtlas();
  const pinRoom = useCallback(
    async ({
      roomId,
      payload,
    }: {
      roomId: number;
      payload: IRoom.UpdateRoomApiPayload;
    }) => {
      await atlas.chat.updateRoom(roomId, payload);
    },
    [atlas.chat]
  );

  return useMutation({
    mutationFn: pinRoom,
    mutationKey: [MutationKey.UpdateRoom],
    onSuccess,
    onError,
  });
}
