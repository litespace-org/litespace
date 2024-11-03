import { ThemedView } from "@/components/ThemedView";
import React, { useEffect } from "react";
import { RTCView } from "react-native-webrtc";
import { StyleSheet, Button } from "react-native";
import { useCall } from "@litespace/headless/calls";
import { MediaStream as NativeStream } from "react-native-webrtc";

declare global {
  interface MediaStream extends NativeStream {}
}

const Call = () => {
  const { mate, user, start, onToggleMic, onToggleCamera } = useCall(1507, 7);

  useEffect(() => {
    start();
  }, [start]);

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
        <Button onPress={onToggleMic} title="Toggle Mic" />
        <Button onPress={onToggleCamera} title="Toggle Camera" />
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
