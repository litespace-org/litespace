import type { Meta, StoryObj } from "@storybook/react";
import { PreCallUserPreview } from "@/components/Call/PreCallUserPreview";
import { faker } from "@faker-js/faker/locale/ar";
import React, { useEffect, useState } from "react";
import { DarkStoryWrapper } from "@/internal/DarkWrapper";
import { getMediaStreamFromVideo } from "@/internal/CallSimulation";

type Component = typeof PreCallUserPreview;

const meta: Meta<Component> = {
  title: "PreCallUserPreview",
  component: PreCallUserPreview,
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
        const stream = await getMediaStreamFromVideo();
        setStream(stream);
      }

      getStream();
    }, []);
    return (
      <div className="tw-flex tw-justify-center tw-flex-col tw-items-center tw-w-[800px]">
        <PreCallUserPreview camera={true} {...props} stream={stream} />
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
      <div className="tw-flex tw-justify-center tw-flex-col tw-items-center tw-w-[800px]">
        <PreCallUserPreview {...props} camera={false} />
      </div>
    );
  },
};

export default meta;
