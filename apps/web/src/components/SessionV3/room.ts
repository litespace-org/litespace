import { env } from "@/lib/env";
import { sockets } from "@litespace/atlas";
import { Room } from "livekit-client";
import { useCallback, useEffect, useMemo } from "react";

const serverUrl = sockets.livekit[env.server];

export function useRoom(token: string) {
  const room = useMemo(() => {
    return new Room({
      // Optimize video quality for each participant's screen
      adaptiveStream: true,
      // Enable automatic audio/video quality optimization
      dynacast: true,
    });
  }, []);

  const onParticipantConnected = useCallback(() => {
    const audio = new Audio("/join-session.mp3");
    audio.play();
  }, []);

  const onParticipantDisconnected = useCallback(() => {
    const audio = new Audio("/leave-session.mp3");
    audio.play();
  }, []);

  useEffect(() => {
    room.on("participantConnected", onParticipantConnected);
    room.on("participantDisconnected", onParticipantDisconnected);

    return () => {
      room.off("participantConnected", onParticipantConnected);
      room.off("participantDisconnected", onParticipantDisconnected);
    };
  }, [onParticipantConnected, onParticipantDisconnected, room]);

  useEffect(() => {
    room.connect(serverUrl, token);
    return () => {
      room.disconnect();
    };
  }, [room, token]);

  useEffect(() => {
    room.localParticipant.enableCameraAndMicrophone();
  }, [room.localParticipant]);

  return room;
}
