export function asSessionRoomId(sessionId: string) {
  return `session:${sessionId}`;
}

export function asChatRoomId(roomId: number) {
  return `room:${roomId}`;
}
