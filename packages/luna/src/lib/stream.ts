import { StreamInfo } from "@/components/Call/types";

export function streamsOrganizer(
  streams: StreamInfo[],
  currentUserId: number
): {
  focused: StreamInfo | undefined;
  unfocused: (StreamInfo | undefined)[];
} {
  let currentUserStream: StreamInfo | undefined;
  let currentUserCast: StreamInfo | undefined;
  let otherUserStream: StreamInfo | undefined;
  let otherUserCast: StreamInfo | undefined;

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
   * Degree of Hirarchy -> Cast then streams and otherUser then currentUser
   */
  if (otherUserCast)
    return {
      focused: otherUserCast,
      unfocused: [currentUserCast, currentUserStream, otherUserStream].filter(
        (stream) => stream !== undefined
      ),
    };

  if (currentUserCast)
    return {
      focused: currentUserCast,
      unfocused: [currentUserStream, otherUserStream].filter(
        (stream) => stream !== undefined
      ),
    };

  if (otherUserStream)
    return {
      focused: otherUserStream,
      unfocused: [currentUserStream].filter((stream) => stream !== undefined),
    };

  return {
    focused: currentUserStream,
    unfocused: [],
  };
}
