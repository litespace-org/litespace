import { IRoom } from "@litespace/types";
import { useCallback, useState } from "react";

export type UncontactedTutorRoomId = `t-${number}`;

export type SelectedRoom = {
  room: number | UncontactedTutorRoomId | null;
  otherMember: IRoom.FindUserRoomsApiRecord["otherMember"] | null;
};

export type SelectRoom = (payload: {
  room: number | UncontactedTutorRoomId | null;
  otherMember: IRoom.FindUserRoomsApiRecord["otherMember"] | null;
}) => void;

/** Make be needed in future
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
*/

export function asTutorRoomId(tutorId: number): UncontactedTutorRoomId {
  return `t-${tutorId}`;
}

export function useSelectedRoom() {
  const [selected, setSelected] = useState<SelectedRoom>({
    room: null,
    otherMember: null,
  });

  const select: SelectRoom = useCallback((payload) => setSelected(payload), []);

  return {
    selected,
    select,
  };
}
