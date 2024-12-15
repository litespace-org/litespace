import type { Meta, StoryObj } from "@storybook/react";
import { Call } from "@/components/Call";
import { DarkStoryWrapper } from "@/internal/DarkWrapper";
import React, { useEffect, useState } from "react";
import { useCreateStream } from "@/internal/hooks/stream";
import dayjs from "dayjs";
import { StreamInfo } from "@/components/Call/types";
import { faker } from "@faker-js/faker/locale/ar";

type Component = typeof Call;

const meta: Meta<Component> = {
  title: "Call/InCallWithoutChat",
  component: Call,
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div className="tw-w-[1000px]">
        <Story />
      </div>
    ),
    DarkStoryWrapper,
  ],
};

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
    leaveCall: () => {},
    chatPanel: <div>This is a Message Component</div>,
  },
  render(props) {
    const stream = useCreateStream("focused", true);
    return <Call {...props} streams={{ focused: stream, unfocused: [] }} />;
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
    leaveCall: () => {},
    chatPanel: <div>This is a Message Component</div>,
    alert: faker.lorem.words(3),
  },
  render(props) {
    const stream = useCreateStream("focused", true);
    return <Call {...props} streams={{ focused: stream, unfocused: [] }} />;
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
    leaveCall: () => {},
    chatPanel: <div>This is a Message Component</div>,
  },
  render(props) {
    const stream = useCreateStream("focused", false);
    return <Call {...props} streams={{ focused: stream, unfocused: [] }} />;
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
    leaveCall: () => {},
    chatPanel: <div>This is a Message Component</div>,
  },
  render(props) {
    const s1 = useCreateStream("focused", true);
    const s2 = useCreateStream("unfocused", false);
    return <Call {...props} streams={{ focused: s1, unfocused: [s2] }} />;
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
    leaveCall: () => {},
    chatPanel: <div>This is a Message Component</div>,
  },
  render(props) {
    const s1 = useCreateStream("focused", false);
    const s2 = useCreateStream("unfocused", true);
    return <Call {...props} streams={{ focused: s1, unfocused: [s2] }} />;
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
    leaveCall: () => {},
    chatPanel: <div>This is a Message Component</div>,
  },
  render(props) {
    const s1 = useCreateStream("focused", false);
    const s2 = useCreateStream("unfocused", false);
    if (!s1 || !s2) return <div></div>;
    return <Call {...props} streams={{ focused: s1, unfocused: [s2] }} />;
  },
};

// 3 users

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
    leaveCall: () => {},
    chatPanel: <div>This is a Message Component</div>,
  },
  render(props) {
    const cast = useCreateStream("focused", true);
    const s1 = useCreateStream("unfocused", true);
    const s2 = useCreateStream("unfocused", true);
    if (!s1 || !s2 || !cast) return <div></div>;
    return <Call {...props} streams={{ focused: cast, unfocused: [s1, s2] }} />;
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
    leaveCall: () => {},
    chatPanel: <div>This is a Message Component</div>,
  },
  render(props) {
    const cast = useCreateStream("focused", true);
    const s1 = useCreateStream("unfocused", false);
    const s2 = useCreateStream("unfocused", false);
    if (!s1 || !s2 || !cast) return <div></div>;
    return <Call {...props} streams={{ focused: cast, unfocused: [s1, s2] }} />;
  },
};

export const FullRoomWithCastWithCameraWithoutCamera: StoryObj<Component> = {
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
    leaveCall: () => {},
    chatPanel: <div>This is a Message Component</div>,
  },
  render(props) {
    const cast = useCreateStream("focused", true);
    const s1 = useCreateStream("unfocused", true);
    const s2 = useCreateStream("unfocused", false);
    return <Call {...props} streams={{ focused: cast, unfocused: [s1, s2] }} />;
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
    leaveCall: () => {},
    chatPanel: <div>This is a Message Component</div>,
  },
  render(props) {
    const initialStream = useCreateStream("focused", false);
    const unfocusedStream = useCreateStream("unfocused", false);
    const [focused, setFocused] = useState<StreamInfo>(initialStream);
    const [unfocused, setUnfocused] = useState<StreamInfo[]>([]);

    useEffect(() => {
      setFocused(initialStream);
    }, [initialStream]);

    useEffect(() => {
      const timeout = setTimeout(() => {
        setUnfocused((prev) => [...prev, unfocusedStream]);
      }, 5_000);

      return () => clearTimeout(timeout);
    }, [unfocusedStream]);

    return (
      <Call
        {...props}
        streams={{
          focused,
          unfocused,
        }}
      />
    );
  },
};

export const NewUserEnteringThenCasting: StoryObj<Component> = {
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
    leaveCall: () => {},
    chatPanel: <div>This is a Message Component</div>,
  },
  render(props) {
    const initialStream = useCreateStream("focused", false);
    const unfocusedStream = useCreateStream("unfocused", false);
    const unfocusedStream2 = useCreateStream("unfocused", false);
    const cast = useCreateStream("focused", false);
    const [focused, setFocused] = useState<StreamInfo>(initialStream);
    const [unfocused, setUnfocused] = useState<StreamInfo[]>([]);

    useEffect(() => {
      setFocused(initialStream);
    }, [initialStream]);

    useEffect(() => {
      const timeout = setTimeout(() => {
        setUnfocused((prev) => [...prev, unfocusedStream]);
      }, 5_000);

      return () => clearTimeout(timeout);
    }, [unfocusedStream]);

    useEffect(() => {
      const timeout = setTimeout(() => {
        setUnfocused((prev) => [...prev, unfocusedStream2]);
      }, 10_000);

      return () => clearTimeout(timeout);
    }, [unfocusedStream2]);

    useEffect(() => {
      const timeout = setTimeout(() => {
        setFocused(cast);
        setUnfocused([initialStream, unfocusedStream, unfocusedStream2]);
      }, 15_000);

      return () => clearTimeout(timeout);
    }, [cast, initialStream, unfocusedStream, unfocusedStream2]);

    return (
      <Call
        {...props}
        streams={{
          focused: focused,
          unfocused: unfocused,
        }}
      />
    );
  },
};

export default meta;
