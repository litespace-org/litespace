import type { Meta, StoryObj } from "@storybook/react";
import { CallBar } from "@/components/Call/CallBar";
import { DarkStoryWrapper } from "@/internal/DarkWrapper";
import React from "react";
import Chat from "@litespace/assets/Chat";
import Video from "@litespace/assets/Video";
import VideoSlash from "@litespace/assets/VideoSlash";
import CastScreen from "@litespace/assets/CastScreen";
import Microphone from "@litespace/assets/Microphone";
import MicrophoneSlash from "@litespace/assets/MicrophoneSlash";

type Component = typeof CallBar;

const meta: Meta<Component> = {
  component: CallBar,
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div className="tw-w-full">
        <Story />
      </div>
    ),
    DarkStoryWrapper,
  ],
};

export const InCall: StoryObj<Component> = {
  args: {
    items: [
      {
        hasError: false,
        toggleFunction: () => {},
        ToggleIcon: { On: CastScreen, Off: CastScreen },
        toggleState: true,
      },
      {
        hasError: false,
        toggleFunction: () => {},
        ToggleIcon: { On: Video, Off: VideoSlash },
        toggleState: false,
      },
      {
        hasError: true,
        toggleFunction: () => {},
        ToggleIcon: { On: Microphone, Off: MicrophoneSlash },
        toggleState: true,
      },

      {
        hasError: false,
        toggleFunction: () => {},
        ToggleIcon: { On: Chat, Off: Chat },
        toggleState: true,
      },
    ],
    leaveCall: () => {},
  },
};

export const PreCall: StoryObj<Component> = {
  args: {
    items: [
      {
        toggleFunction: () => {},
        ToggleIcon: { On: Video, Off: VideoSlash },
        toggleState: true,
      },
      {
        toggleFunction: () => {},
        ToggleIcon: { On: Microphone, Off: MicrophoneSlash },
        toggleState: true,
      },
    ],
  },
};

export default meta;
