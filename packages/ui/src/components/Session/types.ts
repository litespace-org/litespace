export type StreamInfo = {
  /**
   * Determines if the user is speaking or no
   */
  speaking: boolean;
  /**
   * `true` in case the audio tracks in the media stream are enabled.
   */
  audio: boolean;
  /**
   * `true` in case the video tracks in the media stream are enabled.
   */
  video: boolean;
  /**
   * Determines if the stream is for screen casting
   */
  cast: boolean;
  /**
   * The media stream itself that will be given to the video player
   */
  stream: MediaStream | null;
  /**
   * Stream owner details.
   */
  user: {
    id: number;
    imageUrl: string | null;
    name: string | null;
  };
};

export type SessionType = "lesson" | "interview";
