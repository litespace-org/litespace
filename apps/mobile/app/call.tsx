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
  // const { mate, user } = useCall(1507);

  // useEffect(() => {
  //   user.start();
  // }, [user.start]);

  // console.log("screen", user.streams.screen);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    navigator.mediaDevices
      .getDisplayMedia({
        video: true,
        audio: true,
      })
      .then((stream) => {
        setStream(stream);
      });
  }, []);

  console.log(stream?._tracks);

  return (
    <ThemedView>
      {stream ? (
        <RTCView style={styles.rtc} streamURL={stream.toURL()} />
      ) : null}

      {/* <ThemedView style={styles.users}>
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
        <Button onPress={user.screen.share} title="Share Screen" />
      </ThemedView> */}
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
