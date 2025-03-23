import type { Meta, StoryObj } from "@storybook/react";
import { Session } from "@/components/Session";
import { DarkStoryWrapper } from "@/internal/DarkWrapper";
import React, { useEffect, useState } from "react";
import { useUserMediaStreamInfo } from "@/internal/hooks/stream";
import dayjs from "dayjs";
import { StreamInfo } from "@/components/Session/types";

type Component = typeof Session;

const meta: Meta<Component> = {
  title: "Session/SessionWithoutChat",
  component: Session,
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div className="w-[360px] p-4 md:h-[calc(100vh-72px-48px-21px)] md:w-[736px] lg:w-[1000px]">
        <Story />
      </div>
    ),
    DarkStoryWrapper,
  ],
};

const CURRENT_USER_ID = 5;

export const AloneWithCamera: StoryObj<Component> = {
  args: {
    chat: {
      enabled: false,
      toggle: () => alert("toggle chat"),
    },
    video: {
      enabled: true,
      error: false,
      toggle: () => alert("toggle video"),
    },
    audio: {
      enabled: true,
      error: false,
      toggle: () => alert("toggle audio"),
    },
    cast: {
      enabled: false,
      error: false,
      toggle: () => alert("toggle cast"),
    },
    timer: {
      duration: 30,
      startAt: dayjs().toISOString(),
    },
    leave: () => alert("leave session"),
  },
  render(props) {
    const stream = useUserMediaStreamInfo(CURRENT_USER_ID, true);
    return (
      <Session {...props} streams={[stream]} currentUserId={CURRENT_USER_ID} />
    );
  },
};

export const AloneWithoutCamera: StoryObj<Component> = {
  args: {
    chat: {
      enabled: false,
      toggle: () => {},
    },
    video: {
      enabled: true,
      error: false,
      toggle: () => {},
    },
    audio: {
      enabled: true,
      error: false,
      toggle: () => {},
    },
    cast: {
      enabled: false,
      error: false,
      toggle: () => {},
    },
    timer: {
      duration: 30,
      startAt: dayjs().toISOString(),
    },
    leave: () => {},
  },
  render(props) {
    const stream = useUserMediaStreamInfo(CURRENT_USER_ID, false);
    return (
      <Session {...props} streams={[stream]} currentUserId={CURRENT_USER_ID} />
    );
  },
};

export const FocusedWithUnfocusedWithoutCamera: StoryObj<Component> = {
  args: {
    chat: {
      enabled: false,
      toggle: () => {},
    },
    video: {
      enabled: true,
      error: false,
      toggle: () => {},
    },
    audio: {
      enabled: true,
      error: false,
      toggle: () => {},
    },
    cast: {
      enabled: false,
      error: false,
      toggle: () => {},
    },
    timer: {
      duration: 30,
      startAt: dayjs().toISOString(),
    },
    leave: () => {},
  },
  render(props) {
    const s1 = useUserMediaStreamInfo(CURRENT_USER_ID, true);
    const s2 = useUserMediaStreamInfo(undefined, false);
    return (
      <Session {...props} streams={[s1, s2]} currentUserId={CURRENT_USER_ID} />
    );
  },
};

export const FocusedWithoutUnfocusedWithCamera: StoryObj<Component> = {
  args: {
    chat: {
      enabled: false,
      toggle: () => {},
    },
    video: {
      enabled: true,
      error: false,
      toggle: () => {},
    },
    audio: {
      enabled: true,
      error: false,
      toggle: () => {},
    },
    cast: {
      enabled: false,
      error: false,
      toggle: () => {},
    },
    timer: {
      duration: 30,
      startAt: dayjs().toISOString(),
    },
    leave: () => {},
  },
  render(props) {
    const s1 = useUserMediaStreamInfo(CURRENT_USER_ID, false);
    const s2 = useUserMediaStreamInfo(undefined, true);
    return (
      <Session {...props} streams={[s1, s2]} currentUserId={CURRENT_USER_ID} />
    );
  },
};

export const FullRoomWithoutCameras: StoryObj<Component> = {
  args: {
    chat: {
      enabled: false,
      toggle: () => {},
    },
    video: {
      enabled: true,
      error: false,
      toggle: () => {},
    },
    audio: {
      enabled: true,
      error: false,
      toggle: () => {},
    },
    cast: {
      enabled: false,
      error: false,
      toggle: () => {},
    },
    timer: {
      duration: 30,
      startAt: dayjs().toISOString(),
    },
    leave: () => {},
  },
  render(props) {
    const s1 = useUserMediaStreamInfo(CURRENT_USER_ID, false);
    const s2 = useUserMediaStreamInfo(undefined, false);
    return (
      <Session {...props} streams={[s1, s2]} currentUserId={CURRENT_USER_ID} />
    );
  },
};

export const FullRoomWithCastWithCameras: StoryObj<Component> = {
  args: {
    chat: {
      enabled: false,
      toggle: () => {},
    },
    video: {
      enabled: true,
      error: false,
      toggle: () => {},
    },
    audio: {
      enabled: true,
      error: false,
      toggle: () => {},
    },
    cast: {
      enabled: false,
      error: false,
      toggle: () => {},
    },
    timer: {
      duration: 30,
      startAt: dayjs().toISOString(),
    },
    leave: () => {},
  },
  render(props) {
    const s1 = useUserMediaStreamInfo(CURRENT_USER_ID, true);
    const s2 = useUserMediaStreamInfo(undefined, true);
    const cast = useUserMediaStreamInfo(undefined, true, true);
    return (
      <Session
        {...props}
        streams={[s1, s2, cast]}
        currentUserId={CURRENT_USER_ID}
      />
    );
  },
};

export const FullRoomWithCastWithoutCameras: StoryObj<Component> = {
  args: {
    chat: {
      enabled: false,
      toggle: () => {},
    },
    video: {
      enabled: true,
      error: false,
      toggle: () => {},
    },
    audio: {
      enabled: true,
      error: false,
      toggle: () => {},
    },
    cast: {
      enabled: false,
      error: false,
      toggle: () => {},
    },
    timer: {
      duration: 30,
      startAt: dayjs().toISOString(),
    },
    leave: () => {},
  },
  render(props) {
    const s1 = useUserMediaStreamInfo(CURRENT_USER_ID, false);
    const s2 = useUserMediaStreamInfo(undefined, false);
    const cast = useUserMediaStreamInfo(undefined, true, true);
    return (
      <Session
        {...props}
        streams={[s1, s2, cast]}
        currentUserId={CURRENT_USER_ID}
      />
    );
  },
};

// Animation Testing
export const NewUserEntering: StoryObj<Component> = {
  args: {
    chat: {
      enabled: false,
      toggle: () => {},
    },
    video: {
      enabled: true,
      error: false,
      toggle: () => {},
    },
    audio: {
      enabled: true,
      error: false,
      toggle: () => {},
    },
    cast: {
      enabled: false,
      error: false,
      toggle: () => {},
    },
    timer: {
      duration: 30,
      startAt: dayjs().toISOString(),
    },
    leave: () => {},
  },
  render(props) {
    const initialStream = useUserMediaStreamInfo(CURRENT_USER_ID, false);
    const unfocusedStream = useUserMediaStreamInfo(undefined, false);

    const [streams, setStreams] = useState<StreamInfo[]>([]);

    useEffect(() => {
      const timeout = setTimeout(() => {
        setStreams((prev) => [...prev, unfocusedStream]);
      }, 5_000);

      return () => clearTimeout(timeout);
    }, [unfocusedStream]);

    return (
      <Session
        {...props}
        streams={[initialStream, ...streams]}
        currentUserId={CURRENT_USER_ID}
      />
    );
  },
};

export default meta;
