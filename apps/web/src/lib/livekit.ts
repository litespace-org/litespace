import {
  LocalAudioTrack,
  LocalVideoTrack,
  Track,
  isAudioTrack,
  isLocalTrack,
  isVideoTrack,
} from "livekit-client";

export function isLocalVideoTrack(track: Track): track is LocalVideoTrack {
  return isLocalTrack(track) && isVideoTrack(track);
}

export function isLocalAudioTrack(track: Track): track is LocalAudioTrack {
  return isLocalTrack(track) && isAudioTrack(track);
}
