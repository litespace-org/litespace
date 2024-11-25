import { useAtlas } from "@/atlas";
import { IRoom, IUser } from "@litespace/types";
import { useCallback } from "react";
import {
  useInfinitePaginationQuery,
  UseInfinitePaginationQueryResult,
} from "@/query";
import { QueryKey } from "@/constants";

export function useFindUserRooms(
  profile: IUser.Self | null
): UseInfinitePaginationQueryResult<IRoom.FindUserRoomsApiRecord> {
  const atlas = useAtlas();
  const findUserRooms = useCallback(
    async ({ pageParam }: { pageParam: number }) => {
      if (!profile) return { list: [], total: 0 };
      return await atlas.chat.findRooms(profile.id, {
        page: pageParam,
        size: 20,
      });
    },
    [atlas.chat, profile]
  );

  return useInfinitePaginationQuery(findUserRooms, [QueryKey.FindUserRooms]);
}
