import type { Meta, StoryObj } from "@storybook/react";
import { Session } from "@/components/Session";
import { DarkStoryWrapper } from "@/internal/DarkWrapper";
import React, { useEffect, useState } from "react";
import { useUserMediaStreamInfo } from "@/internal/hooks/stream";
import dayjs from "dayjs";
import { StreamInfo } from "@/components/Session/types";
import { faker } from "@faker-js/faker/locale/ar";

type Component = typeof Session;

const meta: Meta<Component> = {
  title: "Session/SessionWithoutChat",
  component: Session,
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div className="w-[1000px]">
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
    camera: {
      enabled: true,
      error: false,
      toggle: () => alert("toggle camera"),
    },
    mic: {
      enabled: true,
      error: false,
      toggle: () => alert("toggle mic"),
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

export const Alert: StoryObj<Component> = {
  args: {
    chat: {
      enabled: false,
      toggle: () => alert("toggle chat"),
    },
    camera: {
      enabled: true,
      error: false,
      toggle: () => alert("toggle camera"),
    },
    mic: {
      enabled: true,
      error: false,
      toggle: () => alert("toggle mic"),
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
    leave: () => {},
    alert: faker.lorem.words(10),
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
    camera: {
      enabled: true,
      error: false,
      toggle: () => {},
    },
    mic: {
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
    camera: {
      enabled: true,
      error: false,
      toggle: () => {},
    },
    mic: {
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
    camera: {
      enabled: true,
      error: false,
      toggle: () => {},
    },
    mic: {
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
    camera: {
      enabled: true,
      error: false,
      toggle: () => {},
    },
    mic: {
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
    chatPanel: <div>This is a Message Component</div>,
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
    camera: {
      enabled: true,
      error: false,
      toggle: () => {},
    },
    mic: {
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
    chatPanel: <div>This is a Message Component</div>,
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
    camera: {
      enabled: true,
      error: false,
      toggle: () => {},
    },
    mic: {
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

export const FullRoomWithFullCast: StoryObj<Component> = {
  args: {
    chat: {
      enabled: false,
      toggle: () => {},
    },
    camera: {
      enabled: true,
      error: false,
      toggle: () => {},
    },
    mic: {
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
    chatPanel: <div>This is a Message Component</div>,
  },
  render(props) {
    const s1 = useUserMediaStreamInfo(CURRENT_USER_ID, true);
    const s2 = useUserMediaStreamInfo(8, false);
    const cast1 = useUserMediaStreamInfo(CURRENT_USER_ID, true, true);
    const cast2 = useUserMediaStreamInfo(8, true, true);
    return (
      <Session
        {...props}
        streams={[s1, s2, cast1, cast2]}
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
    camera: {
      enabled: true,
      error: false,
      toggle: () => {},
    },
    mic: {
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
    const initialStream = useUserMediaStreamInfo(CURRENT_USER_ID, true);
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
