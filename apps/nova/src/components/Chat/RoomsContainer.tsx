import React from "react";
import { SelectedRoom, SelectRoom } from "@litespace/luna/hooks/chat";
import cn from "classnames";
import { Typography } from "@litespace/luna/Typography";
import { useFormatMessage } from "@litespace/luna/hooks/intl";
import { Input } from "@litespace/luna/Input";
import Search from "@litespace/assets/Search";
import Rooms from "@/components/Chat/Rooms";
import { useRoomManager } from "@/hooks/chat";

const RoomsContainer: React.FC<{
  selected: SelectedRoom;
  select: SelectRoom;
}> = ({ select, selected: { room: roomId } }) => {
  const intl = useFormatMessage();
  const { rooms, keyword, update } = useRoomManager();

  return (
    <div
      className={cn(
        "flex flex-col overflow-auto h-screen",
        "w-[400px] border border-natural-200",
        "px-6 pt-8",
        "scrollbar-thin scrollbar-thumb-natural-200 scrollbar-track-natural-100"
      )}
    >
      <div>
        <div className="mb-6">
          <Typography className="font-bold text-xl text-natural-950 mb-6">
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
