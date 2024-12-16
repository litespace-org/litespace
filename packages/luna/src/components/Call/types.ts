export type StreamInfo = {
  /**
   * determines if the user is speaking or no
   */
  speaking: boolean;
  /**
   * determines if the user is muted or not
   */
  muted: boolean;
  /**
   * determines if the user has his camera enabled or not
   */
  camera: boolean;
  /**
   * determines if the stream is for screen casting
   */
  cast: boolean;
  /**
   * The Media stream itself that will be given to the video player
   */
  stream: MediaStream | null;
  /**
   * user details
   */
  user: {
    id: number;
    imageUrl: string | null;
    name: string | null;
  };
};
