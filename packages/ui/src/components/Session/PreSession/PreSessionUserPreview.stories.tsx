import type { Meta, StoryObj } from "@storybook/react";
import { PreSessionUserPreview } from "@/components/Session/PreSession/PreSessionUserPreview";
import { faker } from "@faker-js/faker/locale/ar";
import React, { useEffect, useState } from "react";
import { DarkStoryWrapper } from "@/internal/DarkWrapper";
import { getVideoMediaStream } from "@/internal/utils/stream";

type Component = typeof PreSessionUserPreview;

const meta: Meta<Component> = {
  title: "Session/PreSessionUserPreview",
  component: PreSessionUserPreview,
  parameters: { layout: "centered" },
  decorators: [DarkStoryWrapper],
};

type ComponentProps = {
  stream: MediaStream | null;
  user: {
    id: number;
    imageUrl: string | null;
    name: string | null;
  };
};

export const WithVideo: StoryObj<Component> = {
  args: {
    user: {
      id: 5,
      name: faker.person.fullName(),
      imageUrl: "https://picsum.photos/1900",
    },
  },
  render(props: ComponentProps) {
    const [stream, setStream] = useState<MediaStream | null>(null);
    useEffect(() => {
      async function getStream() {
        const stream = await getVideoMediaStream();
        setStream(stream);
      }

      getStream();
    }, []);
    return (
      <div className="flex justify-center flex-col items-center w-[800px]">
        <PreSessionUserPreview camera={true} {...props} stream={stream} />
      </div>
    );
  },
};

export const WithoutVideo: StoryObj<Component> = {
  args: {
    user: {
      id: 5,
      name: faker.person.fullName(),
      imageUrl: "https://picsum.photos/1900",
    },
  },
  render(props: ComponentProps) {
    return (
      <div className="flex justify-center flex-col items-center w-[800px]">
        <PreSessionUserPreview {...props} camera={false} />
      </div>
    );
  },
};

export default meta;
