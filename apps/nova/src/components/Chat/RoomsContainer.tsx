import React, { ChangeEvent, useCallback, useState } from "react";
import { useInfinteScroll } from "@litespace/luna/hooks/common";
import { SelectedRoom, SelectRoom } from "@litespace/luna/hooks/chat";
import cn from "classnames";
import { Typography } from "@litespace/luna/Typography";
import { useFormatMessage } from "@litespace/luna/hooks/intl";
import { Input } from "@litespace/luna/Input";
import Search from "@litespace/assets/Search";
import { useRoomQuery } from "@/hooks/chat";
import Rooms from "@/components/Chat/Rooms";
import AllMessages from "@litespace/assets/AllMessages";
import Pin from "@litespace/assets/Pin";

const RoomsContainer: React.FC<{
  selected: SelectedRoom;
  select: SelectRoom;
}> = ({ select, selected: { room: roomId } }) => {
  const intl = useFormatMessage();
  const [keyword, setKeyword] = useState<string>("");

  const {
    enabled,
    list: rooms,
    more,
    query,
  } = useRoomQuery({ keyword, queryId: "all" });

  const {
    enabled: pinnedEnabled,
    list: pinnedRooms,
    more: morePinned,
    query: pinnedRoomsQuery,
  } = useRoomQuery({ queryId: "pinned" });

  const onChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setKeyword(value);
      setTimeout(() => {
        query.refetch();
      }, 500);
    },
    [query]
  );

  const refetch = useCallback(() => {
    query.refetch();
    pinnedRoomsQuery.refetch();
  }, [query, pinnedRoomsQuery]);

  const { target: pinnedTarget } = useInfinteScroll<HTMLDivElement>(
    morePinned,
    pinnedEnabled
  );
  const { target } = useInfinteScroll<HTMLDivElement>(more, enabled);

  return (
    <div
      className={cn(
        "flex flex-col bg-background-200 overflow-auto main-scrollbar h-screen",
        "w-20 md:w-80 border border-natural-200",
        "px-6 pt-8"
      )}
    >
      <div>
        <Typography className="font-bold text-xl text-natural-950 mb-6">
          {intl("chat.title")}
        </Typography>
        <Input
          placeholder={intl("chat.search")}
          value={keyword}
          onChange={onChange}
          startActions={[
            {
              id: 1,
              Icon: Search,
              onClick() {
                alert("Clicked!");
              },
            },
          ]}
        />
        {pinnedRooms && pinnedRooms?.length > 0 ? (
          <Rooms
            type="pinned"
            title={intl("chat.pinned.title")}
            Icon={<Pin />}
            query={pinnedRoomsQuery}
            refetch={refetch}
            roomId={roomId}
            rooms={pinnedRooms}
            select={select}
            target={pinnedTarget}
          />
        ) : null}
        <Rooms
          type="all"
          title={intl("chat.all")}
          Icon={<AllMessages />}
          query={query}
          refetch={refetch}
          roomId={roomId}
          rooms={rooms}
          select={select}
          target={target}
        />
      </div>
    </div>
  );
};

export default RoomsContainer;
