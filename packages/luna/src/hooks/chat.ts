import { IRoom } from "@litespace/types";
import { useCallback, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

export type SelectedRoom = {
  room: number | "temporary" | null;
  otherMember: IRoom.FindUserRoomsApiRecord["otherMember"] | null;
};

export type SelectRoom = (payload: {
  room: number | "temporary";
  otherMember: IRoom.FindUserRoomsApiRecord["otherMember"];
}) => void;

const ROOM_URL_PARAM = "room";
const ROOM_CACHE_KEY = "litespace:chat::room";

function asRoomId(room: string | null): number | null {
  if (!room) return null;
  const id = Number(room);
  if (Number.isNaN(id)) return null;
  return id;
}

function saveRoom(room: number) {
  localStorage.setItem(ROOM_CACHE_KEY, room.toString());
  return room;
}

function getCachedRoom() {
  const room = localStorage.getItem(ROOM_CACHE_KEY);
  return asRoomId(room);
}

function getRoomParam(params: URLSearchParams): number | null {
  const room = params.get(ROOM_URL_PARAM);
  return asRoomId(room);
}

export function useSelectedRoom() {
  const [params, setParams] = useSearchParams();

  const preSelection = useMemo(() => {
    const room = getRoomParam(params);
    if (room) return saveRoom(room);
    return getCachedRoom();
  }, [params]);

  const [selected, setSelected] = useState<SelectedRoom>({
    room: preSelection,
    otherMember: null,
  });

  const select: SelectRoom = useCallback(
    (payload) => {
      if (payload.room !== "temporary") saveRoom(payload.room);
      setSelected(payload);
      setParams({
        [ROOM_URL_PARAM]: payload.room.toString(),
      });
    },
    [setParams]
  );

  return {
    selected,
    select,
  };
}
