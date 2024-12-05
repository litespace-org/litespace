import type { Meta, StoryObj } from "@storybook/react";
import { ToggleCallButton } from "@/components/Call/ToggleCallButton";
import { DarkStoryWrapper } from "@/internal/DarkWrapper";
import React from "react";
import Chat from "@litespace/assets/Chat";
import Video from "@litespace/assets/Video";
import VideoSlash from "@litespace/assets/VideoSlash";
import CastScreen from "@litespace/assets/CastScreen";
import Microphone from "@litespace/assets/Microphone";
import MicrophoneSlash from "@litespace/assets/MicrophoneSlash";
type Component = typeof ToggleCallButton;

const meta: Meta<Component> = {
  component: ToggleCallButton,
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div className="tw-w-[278px] tw-h-[341px]">
        <Story />
      </div>
    ),
    DarkStoryWrapper,
  ],
};

export const ChatOn: StoryObj<Component> = {
  args: {
    error: false,
    toggle: () => {},
    OnIcon: Chat,
    OffIcon: Chat,
    active: true,
  },
};
export const ChatOff: StoryObj<Component> = {
  args: {
    error: false,
    toggle: () => {},
    OnIcon: Chat,
    OffIcon: Chat,
    active: false,
  },
};

export const CameraOn: StoryObj<Component> = {
  args: {
    error: false,
    toggle: () => {},
    OnIcon: Video,
    OffIcon: VideoSlash,
    active: true,
  },
};
export const CameraOff: StoryObj<Component> = {
  args: {
    error: false,
    toggle: () => {},
    OnIcon: Video,
    OffIcon: VideoSlash,
    active: false,
  },
};

export const CameraError: StoryObj<Component> = {
  args: {
    error: true,
    toggle: () => {},
    OnIcon: Video,
    OffIcon: VideoSlash,
    active: false,
  },
};

export const MicOn: StoryObj<Component> = {
  args: {
    error: false,
    toggle: () => {},
    OnIcon: Microphone,
    OffIcon: MicrophoneSlash,
    active: true,
  },
};
export const MicOff: StoryObj<Component> = {
  args: {
    error: false,
    toggle: () => {},
    OnIcon: Microphone,
    OffIcon: MicrophoneSlash,
    active: false,
  },
};

export const MicError: StoryObj<Component> = {
  args: {
    error: true,
    toggle: () => {},
    OnIcon: Video,
    OffIcon: VideoSlash,
    active: false,
  },
};

export const ShareScreenOn: StoryObj<Component> = {
  args: {
    error: false,
    toggle: () => {},
    OnIcon: CastScreen,
    OffIcon: CastScreen,
    active: true,
  },
};
export const ShareScreenOff: StoryObj<Component> = {
  args: {
    error: false,
    toggle: () => {},
    OnIcon: CastScreen,
    OffIcon: CastScreen,
    active: false,
  },
};

export default meta;
