import React, { useCallback } from "react";
import { SelectedRoom, SelectRoom } from "@litespace/luna/hooks/chat";
import cn from "classnames";
import { Typography } from "@litespace/luna/Typography";
import { useFormatMessage } from "@litespace/luna/hooks/intl";
import { Input } from "@litespace/luna/Input";
import Search from "@litespace/assets/Search";
import Rooms from "@/components/Chat/Rooms";
import { HEADER_HEIGHT } from "@/constants/ui";
import { useRoomManager } from "@/hooks/chat";
import { RoomsMap } from "@litespace/headless/chat";
import { isEmpty } from "lodash";
import { ITutor, IUser } from "@litespace/types";
import { useUserContext } from "@litespace/headless/context/user";

const RoomsContainer: React.FC<{
  selected: SelectedRoom;
  select: SelectRoom;
  typingMap: RoomsMap;
  usersOnlineMap: RoomsMap;
  setTemporaryTutor: (payload: ITutor.FullUncontactedTutorInfo | null) => void;
}> = ({
  select,
  setTemporaryTutor,
  typingMap,
  usersOnlineMap,
  selected: { room: roomId },
}) => {
  const intl = useFormatMessage();

  const { user } = useUserContext();

  const { rooms, keyword, update } = useRoomManager();

  const selectTemporary = useCallback(
    (tutor: ITutor.FullUncontactedTutorInfo) => {
      setTemporaryTutor(tutor);
      select({ room: "temporary", otherMember: tutor });
    },
    [setTemporaryTutor, select]
  );

  const selectRoom = useCallback(
    ({ room, otherMember }: SelectedRoom) => {
      if (!select || !room || !otherMember) return;
      select({ room, otherMember });
      setTemporaryTutor(null);
    },
    [select, setTemporaryTutor]
  );

  return (
    <div
      style={{ height: `calc(100vh - ${HEADER_HEIGHT}px)` }}
      className={cn(
        "flex flex-col overflow-auto h-screen gap-6",
        "w-[400px] border border-natural-200",
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
              },
            ]}
          />
        </div>

        {rooms.pinned.list && rooms.pinned.list.length > 0 && !keyword.value ? (
          <div className="mb-6">
            <Rooms
              usersOnlineMap={usersOnlineMap}
              typingMap={typingMap}
              toggleMute={update.toggleMute}
              togglePin={update.togglePin}
              type="pinned"
              query={rooms.pinned.query}
              rooms={rooms.pinned.list}
              target={rooms.pinned.target}
              select={selectRoom}
              roomId={roomId}
              enabled={rooms.pinned.enabled}
            />
          </div>
        ) : null}

        {!isEmpty(rooms.all.list) ? (
          <Rooms
            type="all"
            typingMap={typingMap}
            usersOnlineMap={usersOnlineMap}
            toggleMute={update.toggleMute}
            togglePin={update.togglePin}
            query={rooms.all.query}
            rooms={rooms.all.list}
            target={rooms.all.target}
            roomId={roomId}
            select={selectRoom}
            enabled={rooms.all.enabled}
          />
        ) : null}

        {user?.role === IUser.Role.Student ? (
          <Rooms
            type="uncontactedTutors"
            query={rooms.uncontactedTutors.query}
            rooms={rooms.uncontactedTutors.list}
            target={rooms.all.target}
            enabled={rooms.uncontactedTutors.enabled}
            selectUncontacted={selectTemporary}
            roomId={null}
          />
        ) : null}
      </div>
    </div>
  );
};

export default RoomsContainer;
