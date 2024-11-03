import { first, isEmpty } from "lodash";
import React, { useEffect, useMemo } from "react";
import Room from "@/components/Chat/Room";
import { useAppSelector } from "@/redux/store";
import { profileSelectors } from "@/redux/user/profile";
import { useInfinteScroll } from "@litespace/luna/hooks/common";
import { SelectedRoom, SelectRoom } from "@litespace/luna/hooks/chat";
import { Loading } from "@litespace/luna/Loading";
import cn from "classnames";
import { useFindUserRooms } from "@litespace/headless/messageRooms";

const Rooms: React.FC<{
  selected: SelectedRoom;
  select: SelectRoom;
}> = ({ select, selected: { room, members } }) => {
  const profile = useAppSelector(profileSelectors.user);

  const { list: rooms, query, more } = useFindUserRooms(profile);

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
        className={cn("shrink-0", {
          "h-full": query.isLoading,
          "h-10": query.isFetching,
        })}
      />

      <div ref={target} />
    </div>
  );
};

export default Rooms;
