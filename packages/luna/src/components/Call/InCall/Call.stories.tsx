import type { Meta, StoryObj } from "@storybook/react";
import { Call } from "@/components/Call";
import { DarkStoryWrapper } from "@/internal/DarkWrapper";
import React from "react";
import { useCreateStream } from "@/internal/hooks/stream";
import dayjs from "dayjs";

type Component = typeof Call;

const meta: Meta<Component> = {
  title: "Call/Call",
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

// WITHOUT CHAT

// 1 user

export const AloneWithCamera: StoryObj<Component> = {
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
  },
  render(props) {
    const user1Stream = useCreateStream("focused", true);
    if (!user1Stream) return <div></div>;
    return <Call {...props} streams={[user1Stream]} />;
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
  },
  render(props) {
    const user1Stream = useCreateStream("focused", false);
    if (!user1Stream) return <div></div>;
    return <Call {...props} streams={[user1Stream]} />;
  },
};

// 2 users

export const FullRoomWithCameras: StoryObj<Component> = {
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
  },
  render(props) {
    const user1Stream = useCreateStream("focused", true);
    const user2Stream = useCreateStream("unfocused", true);
    if (!user1Stream || !user2Stream) return <div></div>;
    return <Call {...props} streams={[user1Stream, user2Stream]} />;
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
  },
  render(props) {
    const user1Stream = useCreateStream("focused", true);
    const user2Stream = useCreateStream("unfocused", false);
    if (!user1Stream || !user2Stream) return <div></div>;
    return <Call {...props} streams={[user1Stream, user2Stream]} />;
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
  },
  render(props) {
    const user1Stream = useCreateStream("focused", false);
    const user2Stream = useCreateStream("unfocused", true);
    if (!user1Stream || !user2Stream) return <div></div>;
    return <Call {...props} streams={[user1Stream, user2Stream]} />;
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
  },
  render(props) {
    const user1Stream = useCreateStream("focused", false);
    const user2Stream = useCreateStream("unfocused", false);
    if (!user1Stream || !user2Stream) return <div></div>;
    return <Call {...props} streams={[user1Stream, user2Stream]} />;
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
  },
  render(props) {
    const cast = useCreateStream("focused", true);
    const user1Stream = useCreateStream("unfocused", true);
    const user2Stream = useCreateStream("unfocused", true);
    if (!user1Stream || !user2Stream || !cast) return <div></div>;
    return <Call {...props} streams={[user1Stream, user2Stream, cast]} />;
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
  },
  render(props) {
    const cast = useCreateStream("focused", true);
    const user1Stream = useCreateStream("unfocused", false);
    const user2Stream = useCreateStream("unfocused", false);
    if (!user1Stream || !user2Stream || !cast) return <div></div>;
    return <Call {...props} streams={[user1Stream, user2Stream, cast]} />;
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
  },
  render(props) {
    const cast = useCreateStream("focused", true);
    const user1Stream = useCreateStream("unfocused", true);
    const user2Stream = useCreateStream("unfocused", false);
    if (!user1Stream || !user2Stream || !cast) return <div></div>;
    return <Call {...props} streams={[user1Stream, user2Stream, cast]} />;
  },
};

// WITH CHAT
// 1 user

export const ChatAloneWithCamera: StoryObj<Component> = {
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
    leaveCall: () => {},
  },
  render(props) {
    const user1Stream = useCreateStream("focused", true);
    if (!user1Stream) return <div></div>;
    return <Call {...props} streams={[user1Stream]} />;
  },
};

export const ChatAloneWithoutCamera: StoryObj<Component> = {
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
    leaveCall: () => {},
  },
  render(props) {
    const user1Stream = useCreateStream("focused", false);
    if (!user1Stream) return <div></div>;
    return <Call {...props} streams={[user1Stream]} />;
  },
};

// 2 users

export const ChatFullRoomWithCameras: StoryObj<Component> = {
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
    leaveCall: () => {},
  },
  render(props) {
    const user1Stream = useCreateStream("focused", true);
    const user2Stream = useCreateStream("unfocused", true);
    if (!user1Stream || !user2Stream) return <div></div>;
    return <Call {...props} streams={[user1Stream, user2Stream]} />;
  },
};

export const ChatFocusedWithUnfocusedWithoutCamera: StoryObj<Component> = {
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
    leaveCall: () => {},
  },
  render(props) {
    const user1Stream = useCreateStream("focused", true);
    const user2Stream = useCreateStream("unfocused", false);
    if (!user1Stream || !user2Stream) return <div></div>;
    return <Call {...props} streams={[user1Stream, user2Stream]} />;
  },
};

export const ChatFocusedWithoutUnfocusedWithCamera: StoryObj<Component> = {
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
    leaveCall: () => {},
  },
  render(props) {
    const user1Stream = useCreateStream("focused", false);
    const user2Stream = useCreateStream("unfocused", true);
    if (!user1Stream || !user2Stream) return <div></div>;
    return <Call {...props} streams={[user1Stream, user2Stream]} />;
  },
};

export const ChatFullRoomWithoutCameras: StoryObj<Component> = {
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
    leaveCall: () => {},
  },
  render(props) {
    const user1Stream = useCreateStream("focused", false);
    const user2Stream = useCreateStream("unfocused", false);
    if (!user1Stream || !user2Stream) return <div></div>;
    return <Call {...props} streams={[user1Stream, user2Stream]} />;
  },
};

// 3 users

export const ChatFullRoomWithCastWithCameras: StoryObj<Component> = {
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
    leaveCall: () => {},
  },
  render(props) {
    const cast = useCreateStream("focused", true);
    const user1Stream = useCreateStream("unfocused", true);
    const user2Stream = useCreateStream("unfocused", true);
    if (!user1Stream || !user2Stream || !cast) return <div></div>;
    return <Call {...props} streams={[user1Stream, user2Stream, cast]} />;
  },
};

export const ChatFullRoomWithCastWithoutCameras: StoryObj<Component> = {
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
    leaveCall: () => {},
  },
  render(props) {
    const cast = useCreateStream("focused", true);
    const user1Stream = useCreateStream("unfocused", false);
    const user2Stream = useCreateStream("unfocused", false);
    if (!user1Stream || !user2Stream || !cast) return <div></div>;
    return <Call {...props} streams={[user1Stream, user2Stream, cast]} />;
  },
};

export const ChatFullRoomWithCastWithCameraWithoutCamera: StoryObj<Component> =
  {
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
      leaveCall: () => {},
    },
    render(props) {
      const cast = useCreateStream("focused", true);
      const user1Stream = useCreateStream("unfocused", true);
      const user2Stream = useCreateStream("unfocused", false);
      if (!user1Stream || !user2Stream || !cast) return <div></div>;
      return <Call {...props} streams={[user1Stream, user2Stream, cast]} />;
    },
  };

export default meta;
