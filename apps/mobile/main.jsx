import { registerRootComponent } from "expo";
import { ExpoRoot } from "expo-router";
import { registerGlobals } from "react-native-webrtc";

// register global webrtc api to be accessable via peerjs
registerGlobals();

// Must be exported or Fast Refresh won't update the context
export function App() {
  const ctx = require.context("./app");
  return <ExpoRoot context={ctx} />;
}

registerRootComponent(App);
