export function asCallRoomId(callId: number) {
  return `call:${callId}`;
}

export function asChatRoomId(roomId: number) {
  return `room:${roomId}`;
}
