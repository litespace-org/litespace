import { StreamInfo } from "@/components/Session/types";

export function organizeStreams(
  streams: StreamInfo[],
  currentUserId: number,
  floatingStreams: boolean
): {
  focused: StreamInfo | null;
  unfocused: (StreamInfo | null)[];
} {
  let currentUserStream: StreamInfo | null = null;
  let currentUserCast: StreamInfo | null = null;
  let otherUserStream: StreamInfo | null = null;
  let otherUserCast: StreamInfo | null = null;

  /**
   * assigning each stream to a unique variable
   */
  streams.forEach((stream) => {
    if (stream.user.id === currentUserId && stream.cast) {
      currentUserCast = stream;
    }

    if (stream.user.id === currentUserId && !stream.cast) {
      currentUserStream = stream;
    }

    if (stream.user.id !== currentUserId && stream.cast) {
      otherUserCast = stream;
    }
    if (stream.user.id !== currentUserId && !stream.cast) {
      otherUserStream = stream;
    }
  });

  /**
   * if we are on mobile devices and chat is open all will be unfocused
   */
  if (floatingStreams)
    return {
      focused: null,
      unfocused: [
        currentUserCast,
        otherUserCast,
        currentUserStream,
        otherUserStream,
      ].filter((stream) => stream !== null),
    };

  /**
   * Degree of Hirarchy
   * 1. Screens
   * 2. Other user stream.
   * 3. Current user stream.
   */
  if (otherUserCast)
    return {
      focused: otherUserCast,
      unfocused: [currentUserCast, currentUserStream, otherUserStream].filter(
        (stream) => stream !== null
      ),
    };

  if (currentUserCast)
    return {
      focused: currentUserCast,
      unfocused: [currentUserStream, otherUserStream].filter(
        (stream) => stream !== null
      ),
    };

  if (otherUserStream)
    return {
      focused: otherUserStream,
      unfocused: [currentUserStream].filter((stream) => stream !== null),
    };

  return {
    focused: currentUserStream,
    unfocused: [],
  };
}
