import type { Meta, StoryObj } from "@storybook/react";
import { Session } from "@/components/Session";
import { DarkStoryWrapper } from "@/internal/DarkWrapper";
import React, { useEffect, useState } from "react";
import { useCreateStream } from "@/internal/hooks/stream";
import dayjs from "dayjs";
import { StreamInfo } from "@/components/Session/types";
import { faker } from "@faker-js/faker/locale/ar";

type Component = typeof Session;

const meta: Meta<Component> = {
  title: "Session/SessionWithChat",
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
      enabled: true,
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
    chatPanel: <div>This is a Message Component</div>,
  },
  render(props) {
    const stream = useCreateStream(true, CURRENT_USER_ID);
    return (
      <Session {...props} streams={[stream]} currentUserId={CURRENT_USER_ID} />
    );
  },
};

export const Alert: StoryObj<Component> = {
  args: {
    chat: {
      enabled: true,
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
    chatPanel: <div>This is a Message Component</div>,
    alert: faker.lorem.words(3),
  },
  render(props) {
    const stream = useCreateStream(true, CURRENT_USER_ID);
    return (
      <Session {...props} streams={[stream]} currentUserId={CURRENT_USER_ID} />
    );
  },
};

export const AloneWithoutCamera: StoryObj<Component> = {
  args: {
    chat: {
      enabled: true,
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
    const stream = useCreateStream(false, CURRENT_USER_ID);
    return (
      <Session {...props} streams={[stream]} currentUserId={CURRENT_USER_ID} />
    );
  },
};

export const FocusedWithUnfocusedWithoutCamera: StoryObj<Component> = {
  args: {
    chat: {
      enabled: true,
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
    const s1 = useCreateStream(true, CURRENT_USER_ID);
    const s2 = useCreateStream(false);

    return (
      <Session {...props} streams={[s1, s2]} currentUserId={CURRENT_USER_ID} />
    );
  },
};

export const FocusedWithoutUnfocusedWithCamera: StoryObj<Component> = {
  args: {
    chat: {
      enabled: true,
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
    const s1 = useCreateStream(false, CURRENT_USER_ID);
    const s2 = useCreateStream(true);
    return (
      <Session {...props} streams={[s1, s2]} currentUserId={CURRENT_USER_ID} />
    );
  },
};

export const FullRoomWithoutCameras: StoryObj<Component> = {
  args: {
    chat: {
      enabled: true,
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
    const s1 = useCreateStream(false, CURRENT_USER_ID);
    const s2 = useCreateStream(false);
    if (!s1 || !s2) return <div></div>;
    return (
      <Session {...props} streams={[s1, s2]} currentUserId={CURRENT_USER_ID} />
    );
  },
};

// 3 users

export const FullRoomWithCastWithCameras: StoryObj<Component> = {
  args: {
    chat: {
      enabled: true,
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
    const cast = useCreateStream(true, CURRENT_USER_ID, true);
    const s1 = useCreateStream(true, CURRENT_USER_ID);
    const s2 = useCreateStream(true);
    if (!s1 || !s2 || !cast) return <div></div>;
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
      enabled: true,
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
    const cast = useCreateStream(true, CURRENT_USER_ID, true);
    const s1 = useCreateStream(false, CURRENT_USER_ID);
    const s2 = useCreateStream(false);
    if (!s1 || !s2 || !cast) return <div></div>;
    return (
      <Session
        {...props}
        streams={[s1, s2, cast]}
        currentUserId={CURRENT_USER_ID}
      />
    );
  },
};

export const FullRoomWithCastWithCameraWithoutCamera: StoryObj<Component> = {
  args: {
    chat: {
      enabled: true,
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
    const cast = useCreateStream(true, CURRENT_USER_ID, true);
    const s1 = useCreateStream(true, CURRENT_USER_ID);
    const s2 = useCreateStream(false);
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
      enabled: true,
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
    const cast = useCreateStream(true, CURRENT_USER_ID, true);
    const cast2 = useCreateStream(true, 8, true);
    const s1 = useCreateStream(true, CURRENT_USER_ID);
    const s2 = useCreateStream(false, 8);
    return (
      <Session
        {...props}
        streams={[s1, s2, cast, cast2]}
        currentUserId={CURRENT_USER_ID}
      />
    );
  },
};

// Animation Testing
export const NewUserEntering: StoryObj<Component> = {
  args: {
    chat: {
      enabled: true,
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
    const initialStream = useCreateStream(false, CURRENT_USER_ID);
    const unfocusedStream = useCreateStream(false);

    const [streams, setStreams] = useState<StreamInfo[]>([]);

    useEffect(() => {
      setStreams([initialStream]);
      //eslint-disable-next-line
    }, []);

    useEffect(() => {
      const timeout = setTimeout(() => {
        setStreams((prev) => [...prev, unfocusedStream]);
      }, 5_000);

      return () => clearTimeout(timeout);
      //eslint-disable-next-line
    }, []);

    return (
      <Session {...props} streams={streams} currentUserId={CURRENT_USER_ID} />
    );
  },
};

export default meta;
