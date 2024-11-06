import { useAtlas } from "@/atlas";
import { IRoom, IUser, Paginated, Void } from "@litespace/types";
import { useCallback } from "react";
import { useInfinitePaginationQuery } from "@/query";
import { InfiniteData, UseInfiniteQueryResult } from "@tanstack/react-query";

type UserRooms = {
  query: UseInfiniteQueryResult<
    InfiniteData<Paginated<IRoom.PopulatedMember[]>, unknown>,
    Error
  >;
  list: IRoom.PopulatedMember[][] | null;
  more: Void;
};

export function useFindUserRooms(profile: IUser.Self | null): UserRooms {
  const atlas = useAtlas();
  const findUserRooms = useCallback(
    async ({ pageParam }: { pageParam: number }) => {
      if (!profile) return { list: [], total: 0 };
      return await atlas.chat.findRooms(profile.id, {
        page: pageParam,
        size: 20,
      });
    },
    [profile]
  );

  return useInfinitePaginationQuery(findUserRooms, ["find-user-rooms"]);
}
