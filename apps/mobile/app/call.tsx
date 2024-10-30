import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import React, { useEffect, useCallback, useState } from "react";
import peer from "@/lib/peer";
import { RTCView } from "react-native-webrtc";
import { useUserMedia } from "@/hooks/call";
import { StyleSheet } from "react-native";
import { useSocket } from "@litespace/headless/socket";
import { Wss } from "@litespace/types";
import { MediaConnection } from "peerjs";

const callId = 1506;

const Call = () => {
  const { start, stream: userMediaStream } = useUserMedia();
  const socket = useSocket();
  const [remoteMediaStream, setRemoteMediaStream] =
    useState<MediaStream | null>(null);
  const [remoteScreenStream, setRemoteScreenStream] =
    useState<MediaStream | null>(null);
  const [mediaConnection, setMediaConnection] =
    useState<MediaConnection | null>(null);

  useEffect(() => {
    start();
  }, [start]);

  const acknowledgePeer = useCallback(
    (peerId: string) => {
      if (!callId || !socket) return;
      socket.emit(Wss.ClientEvent.PeerOpened, { peerId, callId });
    },
    [callId, socket]
  );

  // executed on the receiver side
  const onCall = useCallback(
    (call: MediaConnection) => {
      setMediaConnection(call);
      call.answer(userMediaStream || undefined);
      call.on("stream", (stream: MediaStream) => {
        if (call.metadata?.screen) return setRemoteScreenStream(stream);
        return setRemoteMediaStream(stream);
      });
      call.on("close", () => {
        if (call.metadata?.screen) return setRemoteScreenStream(null);
        return setRemoteMediaStream(null);
      });
    },
    [userMediaStream]
  );

  const onJoinCall = useCallback(
    ({ peerId }: { peerId: string }) => {
      console.log(`${peerId} joined the call`);
      setTimeout(() => {
        if (!userMediaStream) return;
        // shared my stream with the connected user
        const call = peer.call(peerId, userMediaStream);
        setMediaConnection(call);
        call.on("stream", setRemoteMediaStream);
        call.on("close", () => setRemoteMediaStream(null));
      }, 3000);
    },
    [userMediaStream]
  );

  useEffect(() => {
    acknowledgePeer(peer.id);
    // peer.on("open", acknowledgePeer);
    // return () => {
    //   peer.off("open", acknowledgePeer);
    // };
  }, [acknowledgePeer]);

  useEffect(() => {
    if (!socket) return;
    socket.on(Wss.ServerEvent.UserJoinedCall, onJoinCall);
    return () => {
      socket.off(Wss.ServerEvent.UserJoinedCall, onJoinCall);
    };
  }, [onJoinCall, socket]);

  useEffect(() => {
    // listen for calls
    peer.on("call", onCall);
    return () => {
      peer.off("call", onCall);
    };
  }, [onCall]);

  return (
    <ThemedView>
      <ThemedText>TEXT</ThemedText>

      {userMediaStream ? (
        <RTCView
          style={styles.rtc}
          mirror={true}
          objectFit="contain"
          // @ts-ignore
          streamURL={userMediaStream.toURL()}
        />
      ) : null}

      {remoteMediaStream ? (
        <RTCView
          style={styles.rtc}
          mirror={true}
          objectFit="contain"
          // @ts-ignore
          streamURL={remoteMediaStream.toURL()}
        />
      ) : null}
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  rtc: {
    width: 400,
    height: 400,
    borderWidth: 2,
    backgroundColor: "#f2f2f2",
  },
});

export default Call;
