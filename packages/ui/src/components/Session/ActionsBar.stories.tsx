import { StoryObj, Meta } from "@storybook/react";
import { ActionsBar } from "@/components/Session/ActionsBar";
import CastScreen from "@litespace/assets/CastScreen";
import Video from "@litespace/assets/Video";
import VideoSlash from "@litespace/assets/VideoSlash";
import Microphone from "@litespace/assets/Microphone";
import MicrophoneSlash from "@litespace/assets/MicrophoneSlash";
import Chat from "@litespace/assets/Chat";

type Component = typeof ActionsBar;
type Story = StoryObj<Component>;

const meta: Meta<Component> = {
  title: "Session/ActionsBar",
  component: ActionsBar,
};

export const Primary: Story = {
  args: {
    leave: () => {
      alert("Leave");
    },
    items: [
      {
        enabled: true,
        OnIcon: CastScreen,
        OffIcon: CastScreen,
        toggle: () => {
          alert("Toggle Cast");
        },
      },
      {
        enabled: true,
        OnIcon: Video,
        OffIcon: VideoSlash,
        toggle: () => alert("Toggle Video"),
        error: false,
      },
      {
        enabled: true,
        OnIcon: Microphone,
        OffIcon: MicrophoneSlash,
        toggle: () => {},
        error: false,
      },
      {
        enabled: false,
        OnIcon: Chat,
        OffIcon: Chat,
        toggle: () => {},
      },
    ],
  },
};

export default meta;
