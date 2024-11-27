import { useAtlas } from "@/atlas";
import { IRoom, IUser, Void } from "@litespace/types";
import { useCallback } from "react";
import {
  useInfinitePaginationQuery,
  UseInfinitePaginationQueryResult,
} from "@/query";
import { MutationKey, QueryKey } from "@/constants";
import { useMutation } from "@tanstack/react-query";

type OnSuccess = Void;
type OnError = (err: Error) => void;

export function useFindUserRooms(
  profile: IUser.Self | null,
  queryId: "all" | "pinned",
  settings?: {
    pinned?: boolean;
    muted?: boolean;
    keyword?: string;
  }
): UseInfinitePaginationQueryResult<IRoom.FindUserRoomsApiRecord> {
  const atlas = useAtlas();
  const findUserRooms = useCallback(
    async ({ pageParam }: { pageParam: number }) => {
      if (!profile) return { list: [], total: 0 };
      return await atlas.chat.findRooms(profile.id, {
        page: pageParam,
        size: 20,
        ...settings,
      });
    },
    [atlas.chat, profile, settings]
  );

  return useInfinitePaginationQuery(findUserRooms, [
    QueryKey.FindUserRooms,
    queryId,
  ]);
}

export function useTogglePinRoom(onSuccess: OnSuccess, onError: OnError) {
  const atlas = useAtlas();
  const pinRoom = useCallback(
    async ({ roomId, pinned }: { roomId: number; pinned: boolean }) => {
      await atlas.chat.updateRoom(roomId, { pinned });
    },
    [atlas.chat]
  );

  return useMutation({
    mutationFn: pinRoom,
    mutationKey: [MutationKey.PinRoom],
    onSuccess,
    onError,
  });
}

export function useToggleMuteRoom(onSuccess: OnSuccess, onError: OnError) {
  const atlas = useAtlas();
  const pinRoom = useCallback(
    async ({ roomId, muted }: { roomId: number; muted: boolean }) => {
      await atlas.chat.updateRoom(roomId, { muted });
    },
    [atlas.chat]
  );

  return useMutation({
    mutationFn: pinRoom,
    mutationKey: [MutationKey.PinRoom],
    onSuccess,
    onError,
  });
}
