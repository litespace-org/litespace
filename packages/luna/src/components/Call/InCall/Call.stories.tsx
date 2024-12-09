import type { Meta, StoryObj } from "@storybook/react";
import { Call } from "@/components/Call";
import { DarkStoryWrapper } from "@/internal/DarkWrapper";
import React, { useEffect, useState } from "react";
import { getVideoMediaStream } from "@/internal/utils/stream";
// import { faker } from "@faker-js/faker/locale/ar";
// import { IUser, Void } from "@litespace/types";
// import { getMediaStreamFromVideo } from "@/internal/CallSimulation";

type Component = typeof Call;

const meta: Meta<Component> = {
  title: "Call/Call",
  component: Call,
  parameters: { layout: "centered" },
  decorators: [DarkStoryWrapper],
};

// type ComponentProps = {
//   talking: boolean;
//   users: { id: number; name: string | null; image: string | null }[];
//   fullScreen: { enabled: boolean; toggle: Void };
//   chat: { enabled: boolean; toggle: Void };
//   camera: {
//     enabled: boolean;
//     error?: boolean;
//     toggle: Void;
//   };
//   mic: {
//     enabled: boolean;
//     toggle: Void;
//     error?: boolean;
//   };
//   timer: {
//     duration: string;
//     startAt: string;
//   };
//   leaveCall: Void;
//   messagesComponent: React.ReactNode;
// };

export const Primary: StoryObj<Component> = {
  args: {
    speaking: true,
    users: [],
    fullScreen: {
      enabled: false,
      toggle: () => {},
    },
    camera: {
      enabled: false,
      toggle: () => {},
    },
    cast: {
      enabled: false,
      toggle: () => {},
    },
    mic: {
      enabled: false,
      toggle: () => {},
    },
    chat: {
      enabled: false,
      toggle: () => {},
    },
    leaveCall: () => {},
  },
  render(props) {
    const [stream, setStream] = useState<MediaStream | null>(null);
    useEffect(() => {
      async function getStream() {
        const stream = await getVideoMediaStream();
        setStream(stream);
      }

      getStream();
    }, []);
    return <Call {...props} stream={stream} />;
  },
};

export default meta;
