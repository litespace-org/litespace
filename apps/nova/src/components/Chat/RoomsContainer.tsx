import React from "react";
import { SelectedRoom, SelectRoom } from "@litespace/luna/hooks/chat";
import cn from "classnames";
import { Typography } from "@litespace/luna/Typography";
import { useFormatMessage } from "@litespace/luna/hooks/intl";
import { Input } from "@litespace/luna/Input";
import Search from "@litespace/assets/Search";
import Rooms from "@/components/Chat/Rooms";
import { IRoom, Paginated } from "@litespace/types";
import { InfiniteData, UseInfiniteQueryResult } from "@tanstack/react-query";

const RoomsContainer: React.FC<{
  selected: SelectedRoom;
  select: SelectRoom;
  update: {
    toggleMute: ({ roomId, muted }: { roomId: number; muted: boolean }) => void;
    togglePin: ({
      roomId,
      pinned,
    }: {
      roomId: number;
      pinned: boolean;
    }) => void;
  };
  keyword: {
    value: string;
    set: (keyword: string) => void;
  };
  rooms: {
    all: {
      list: IRoom.FindUserRoomsApiRecord[] | null;
      query: UseInfiniteQueryResult<
        InfiniteData<Paginated<IRoom.FindUserRoomsApiRecord>, unknown>,
        Error
      >;
      target: React.RefObject<HTMLDivElement>;
      enabled: boolean;
    };
    pinned: {
      query: UseInfiniteQueryResult<
        InfiniteData<Paginated<IRoom.FindUserRoomsApiRecord>, unknown>,
        Error
      >;
      list: IRoom.FindUserRoomsApiRecord[] | null;
      target: React.RefObject<HTMLDivElement>;
      enabled: boolean;
    };
  };
}> = ({ select, selected: { room: roomId }, update, keyword, rooms }) => {
  const intl = useFormatMessage();

  return (
    <div
      style={{ height: "calc(100vh - 106px)" }}
      className={cn(
        "flex flex-col overflow-auto",
        "w-[400px] border-l border-natural-200",
        "px-6 pt-8",
        "scrollbar-thin scrollbar-thumb-natural-200 scrollbar-track-natural-100"
      )}
    >
      <div>
        <div className="mb-6">
          <Typography
            weight="bold"
            element="subtitle-2"
            className=" text-natural-950 mb-6"
          >
            {intl("chat.title")}
          </Typography>
          <Input
            placeholder={intl("chat.search")}
            value={keyword.value}
            onChange={(e) => keyword.set(e.target.value)}
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
        </div>

        {rooms.pinned.list && rooms.pinned.list.length > 0 && !keyword.value ? (
          <div className="mb-6">
            <Rooms
              toggleMute={update.toggleMute}
              togglePin={update.togglePin}
              type="pinned"
              query={rooms.pinned.query}
              rooms={rooms.pinned.list}
              target={rooms.pinned.target}
              select={select}
              roomId={roomId}
              enabled={rooms.pinned.enabled}
            />
          </div>
        ) : null}

        <Rooms
          type="all"
          toggleMute={update.toggleMute}
          togglePin={update.togglePin}
          query={rooms.all.query}
          rooms={rooms.all.list}
          target={rooms.all.target}
          roomId={roomId}
          select={select}
          enabled={rooms.all.enabled}
        />
      </div>
    </div>
  );
};

export default RoomsContainer;
