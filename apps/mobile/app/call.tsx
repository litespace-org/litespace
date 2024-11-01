import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import React, { useEffect, useState } from "react";
import { RTCView } from "react-native-webrtc";
import { StyleSheet, Button } from "react-native";
import { useCall } from "@litespace/headless/calls";
import { MediaStream as NativeStream } from "react-native-webrtc";

declare global {
  interface MediaStream extends NativeStream {}
}

const Call = () => {
  const { mate, user, mediaConnection } = useCall(1507);

  useEffect(() => {
    user.start();
  }, [user.start]);

  useEffect(() => {
    const interval = setInterval(async () => {
      if (!mediaConnection || !mediaConnection.peerConnection) return;

      const userAudioTrack = user.streams.self?.getAudioTracks()[0];
      if (!userAudioTrack) return;

      // const mateAudioTrack = mate.streams.self?.getAudioTracks()[0];
      // if (!mateAudioTrack) return;

      const stats = await mediaConnection.peerConnection.getStats(
        userAudioTrack
      );
      for (const result of stats.values()) {
        if (result.type === "media-source" && result.kind === "audio") {
          console.log(result.audioLevel);
        }
      }
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, [user.streams.self, mediaConnection]);

  return (
    <ThemedView>
      <ThemedView style={styles.users}>
        {user.streams.self ? (
          <RTCView
            style={styles.rtc}
            mirror={true}
            objectFit="contain"
            streamURL={user.streams.self.toURL()}
          />
        ) : null}

        {mate.streams.self ? (
          <RTCView
            style={styles.rtc}
            mirror={true}
            objectFit="contain"
            streamURL={mate.streams.self.toURL()}
          />
        ) : null}
      </ThemedView>

      <ThemedView>
        {user.streams.screen ? (
          <RTCView
            style={styles.rtc}
            mirror={true}
            objectFit="contain"
            streamURL={user.streams.screen.toURL()}
          />
        ) : null}
      </ThemedView>

      <ThemedView>
        <Button onPress={user.toggleMic} title="Toggle Mic" />
        <Button onPress={user.toggleCamera} title="Toggle Camera" />
      </ThemedView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  rtc: {
    width: "50%",
    height: 400,
    borderWidth: 2,
    backgroundColor: "#f2f2f2",
  },
  users: {
    display: "flex",
    flexDirection: "row",
  },
});

export default Call;
