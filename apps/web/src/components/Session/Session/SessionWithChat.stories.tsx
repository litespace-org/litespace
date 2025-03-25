import type { Meta, StoryObj } from "@storybook/react";
import { Session, type Props } from "@/components/Session/Session/Session";
import React, { useEffect, useState } from "react";
import { useUserMediaStreamInfo } from "@/storybookInternals/hooks/stream";
import dayjs from "dayjs";
import { StreamInfo } from "@/components/Session/types";

type Component = typeof Session;

const meta: Meta<Component> = {
  title: "Session/SessionWithChat",
  component: Session,
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div className="w-[360px] p-4 h-[calc(100vh-72px-48px-21px)] md:w-[736px] lg:w-[1000px]">
        <Story />
      </div>
    ),
  ],
};

const CURRENT_USER_ID = 5;

const SessionComponent: React.FC<Props> = (props) => {
  const stream = useUserMediaStreamInfo(CURRENT_USER_ID, true);
  return (
    <Session {...props} streams={[stream]} currentUserId={CURRENT_USER_ID} />
  );
};

const FocusedWithUnfocusedWithoutCameraComponent: React.FC<Props> = (props) => {
  const s1 = useUserMediaStreamInfo(CURRENT_USER_ID, true);
  const s2 = useUserMediaStreamInfo(undefined, false);
  return (
    <Session {...props} streams={[s1, s2]} currentUserId={CURRENT_USER_ID} />
  );
};

const FocusedWithoutUnfocusedWithCameraComponent: React.FC<Props> = (props) => {
  const s1 = useUserMediaStreamInfo(CURRENT_USER_ID, true);
  const s2 = useUserMediaStreamInfo(undefined, false);
  return (
    <Session {...props} streams={[s1, s2]} currentUserId={CURRENT_USER_ID} />
  );
};

const FullRoomWithoutComponent: React.FC<Props> = (props) => {
  const s1 = useUserMediaStreamInfo(CURRENT_USER_ID, false);
  const s2 = useUserMediaStreamInfo(undefined, false);
  return (
    <Session {...props} streams={[s1, s2]} currentUserId={CURRENT_USER_ID} />
  );
};

const FullRoomWithCastComponent: React.FC<Props> = (props) => {
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
};

const NewUserEnteringComponent: React.FC<Props> = (props) => {
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
};

export const AloneWithCamera: StoryObj<Component> = {
  args: {
    chat: {
      enabled: true,
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
    chatPanel: <div>This is the message component</div>,
  },
  render(props) {
    return <SessionComponent {...props} />;
  },
};

export const AloneWithoutCamera: StoryObj<Component> = {
  args: {
    chat: {
      enabled: true,
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
    chatPanel: <div>This is the message component</div>,
  },
  render(props) {
    return <SessionComponent {...props} />;
  },
};

export const FocusedWithUnfocusedWithoutCamera: StoryObj<Component> = {
  args: {
    chat: {
      enabled: true,
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
    chatPanel: <div>This is the message component</div>,
  },
  render(props) {
    return <FocusedWithUnfocusedWithoutCameraComponent {...props} />;
  },
};

export const FocusedWithoutUnfocusedWithCamera: StoryObj<Component> = {
  args: {
    chat: {
      enabled: true,
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
    chatPanel: <div>This is the message component</div>,
  },
  render(props) {
    return <FocusedWithoutUnfocusedWithCameraComponent {...props} />;
  },
};

export const FullRoomWithoutCameras: StoryObj<Component> = {
  args: {
    chat: {
      enabled: true,
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
    chatPanel: <div>This is a Message Component</div>,
  },
  render(props) {
    return <FullRoomWithoutComponent {...props} />;
  },
};

export const FullRoomWithCastWithCameras: StoryObj<Component> = {
  args: {
    chat: {
      enabled: true,
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
    chatPanel: <div>This is a Message Component</div>,
  },
  render(props) {
    return <FullRoomWithCastComponent {...props} />;
  },
};

export const FullRoomWithCastWithoutCameras: StoryObj<Component> = {
  args: {
    chat: {
      enabled: true,
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
    chatPanel: <div>This is the message component</div>,
  },
  render(props) {
    return <FullRoomWithCastComponent {...props} />;
  },
};

// Animation Testing
export const NewUserEntering: StoryObj<Component> = {
  args: {
    chat: {
      enabled: true,
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
    chatPanel: <div>This is the message component</div>,
  },
  render(props) {
    return <NewUserEnteringComponent {...props} />;
  },
};

export default meta;
