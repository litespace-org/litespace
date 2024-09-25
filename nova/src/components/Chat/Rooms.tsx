import { first } from "lodash";
import React, { useCallback, useMemo } from "react";
import Room from "./Room";
import { useAppSelector } from "@/redux/store";
import { profileSelector } from "@/redux/user/me";
import { atlas } from "@/lib/atlas";
import {
  Loading,
  SelectRoom,
  useInfinteScroll,
  usePaginationQuery,
} from "@litespace/luna";
import cn from "classnames";

const Rooms: React.FC<{
  room: number | null;
  select: SelectRoom;
}> = ({ select, room }) => {
  const profile = useAppSelector(profileSelector);

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

  const {
    list: rooms,
    query,
    more,
  } = usePaginationQuery(findUserRooms, ["find-user-rooms"]);

  const enabled = useMemo(
    () => query.hasNextPage && !query.isLoading && !query.isFetching,
    [query.hasNextPage, query.isFetching, query.isLoading]
  );
  const { target } = useInfinteScroll<HTMLDivElement>(more, enabled);

  return (
    <div
      className={cn(
        "flex flex-col bg-background-200 overflow-auto main-scrollbar mb-1",
        "w-20 md:w-80"
      )}
    >
      {rooms?.map((members) => {
        const member = first(members);
        if (!member) return null;
        return (
          <Room
            key={member.roomId}
            select={() => select({ room: member.roomId, members })}
            active={member.roomId === room}
            members={members}
          />
        );
      })}

      <Loading
        show={query.isFetching || query.isLoading}
        className={cn("inline-block shrink-0", {
          "h-full": query.isLoading,
          "h-10": query.isFetching,
        })}
      />

      <div ref={target} />
    </div>
  );
};

export default Rooms;
