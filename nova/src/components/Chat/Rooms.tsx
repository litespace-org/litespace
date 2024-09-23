import { IRoom } from "@litespace/types";
import { first, values } from "lodash";
import React, { useMemo } from "react";
import Room from "./Room";

const Rooms: React.FC<{
  map?: IRoom.RoomMap;
  room: number | null;
  setRoom: (id: number) => void;
}> = ({ map, setRoom, room }) => {
  const rooms = useMemo(() => (map ? values(map) : []), [map]);
  return (
    <div className="flex flex-col">
      {rooms.map((members) => {
        const member = first(members);
        if (!member) return null;
        return (
          <Room
            key={member.roomId}
            select={() => setRoom(member.roomId)}
            active={member.roomId === room}
            members={members}
          />
        );
      })}
    </div>
  );
};

export default Rooms;
