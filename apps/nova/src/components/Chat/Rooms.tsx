import { first, isEmpty } from "lodash";
import React, { useCallback, useEffect, useMemo } from "react";
import Room from "@/components/Chat/Room";
import { useAppSelector } from "@/redux/store";
import { profileSelector } from "@/redux/user/profile";
import {
  Loading,
  SelectedRoom,
  SelectRoom,
  useInfinteScroll,
  usePaginationQuery,
  atlas,
} from "@litespace/luna";
import cn from "classnames";

const Rooms: React.FC<{
  selected: SelectedRoom;
  select: SelectRoom;
}> = ({ select, selected: { room, members } }) => {
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

  useEffect(() => {
    // handle the case if a room is preselected but without members.
    if (room && isEmpty(members) && rooms) {
      const roomMembers = rooms.find((members) => {
        const member = first(members);
        return member?.roomId === room;
      });
      if (!roomMembers) return;
      select({ room, members: roomMembers });
    }
  }, [members, room, rooms, select]);

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
