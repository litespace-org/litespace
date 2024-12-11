import type { Meta, StoryObj } from "@storybook/react";
import { Call } from "@/components/Call";
import { DarkStoryWrapper } from "@/internal/DarkWrapper";
import React, { useEffect, useState } from "react";
import { useCreateStream } from "@/internal/hooks/stream";
import dayjs from "dayjs";
import { Stream } from "@/internal/utils/stream";
import { isEmpty } from "lodash";

type Component = typeof Call;

/**
 * The entire Call component, designed to be plugged into nova directly
 */

const meta: Meta<Component> = {
  title: "Call/InCallWithChat",
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
    leaveCall: () => {},
    messagesComponent: <div>This is a Message Component</div>,
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
    messagesComponent: <div>This is a Message Component</div>,
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
    messagesComponent: <div>This is a Message Component</div>,
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
    messagesComponent: <div>This is a Message Component</div>,
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
    messagesComponent: <div>This is a Message Component</div>,
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
    messagesComponent: <div>This is a Message Component</div>,
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
    messagesComponent: <div>This is a Message Component</div>,
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
    messagesComponent: <div>This is a Message Component</div>,
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
    messagesComponent: <div>This is a Message Component</div>,
  },
  render(props) {
    const cast = useCreateStream("focused", true);
    const user1Stream = useCreateStream("unfocused", true);
    const user2Stream = useCreateStream("unfocused", false);
    if (!user1Stream || !user2Stream || !cast) return <div></div>;
    return <Call {...props} streams={[user1Stream, user2Stream, cast]} />;
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
    leaveCall: () => {},
    messagesComponent: <div>This is a Message Component</div>,
  },
  render(props) {
    const [streams, setStreams] = useState<Stream[]>([]);
    const initialStream = useCreateStream("focused", false);

    const FocusedStream = useCreateStream("focused", false);
    const UnfocusedStream = useCreateStream("unfocused", false);
    useEffect(() => {
      const timeout = setTimeout(() => {
        if (!isEmpty(streams)) return;
        if (FocusedStream && UnfocusedStream)
          setStreams([FocusedStream, UnfocusedStream]);
      }, 5_000);
      return () => clearTimeout(timeout);
    }, [FocusedStream, UnfocusedStream, streams]);

    if (!initialStream) return <div></div>;
    return (
      <Call {...props} streams={isEmpty(streams) ? [initialStream] : streams} />
    );
  },
};

export const NewUserEnteringThenCasting: StoryObj<Component> = {
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
    messagesComponent: <div>This is a Message Component</div>,
  },
  render(props) {
    const [streams, setStreams] = useState<Stream[]>([]);
    const initialStream = useCreateStream("focused", false);

    const FocusedStream = useCreateStream("focused", false);
    const UnfocusedStream = useCreateStream("unfocused", false);
    const UnfocusedStream2 = useCreateStream("unfocused", false);
    const cast = useCreateStream("focused", false);

    useEffect(() => {
      const timeout = setTimeout(() => {
        if (!isEmpty(streams)) return;
        if (FocusedStream && UnfocusedStream) {
          setStreams([FocusedStream, UnfocusedStream]);
          setTimeout(() => {
            if (UnfocusedStream2 && cast)
              setStreams([UnfocusedStream, UnfocusedStream2, cast]);
          }, 5_000);
        }
      }, 5_000);
      return () => clearTimeout(timeout);
    }, [FocusedStream, UnfocusedStream, streams, UnfocusedStream2, cast]);

    if (!initialStream) return <div></div>;
    return (
      <Call {...props} streams={isEmpty(streams) ? [initialStream] : streams} />
    );
  },
};

export default meta;
