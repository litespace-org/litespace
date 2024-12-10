import type { Meta, StoryObj } from "@storybook/react";
import { CallAvatar } from "@/components/Call/CallAvatar";
import { faker } from "@faker-js/faker/locale/ar";
import { DarkStoryWrapper } from "@/internal/DarkWrapper";
import React, { useEffect, useState } from "react";

type Component = typeof CallAvatar;

const meta: Meta<Component> = {
  title: "Call/CallAvatar",
  component: CallAvatar,
  parameters: { layout: "centered" },
  decorators: [DarkStoryWrapper],
};

export const Speaking: StoryObj<Component> = {
  args: {
    user: {
      id: 5,
      name: faker.person.fullName(),
      imageUrl: "https://picsum.photos/500",
    },
    speaking: true,
  },
};

export const AvatarTalking: StoryObj<Component> = {
  args: {
    user: {
      id: 5,
      name: faker.person.fullName(),
      imageUrl: "https://picsum.photos/500",
    },
  },
  render(props: {
    user: {
      id: number;
      imageUrl: string | null;
      name: string | null;
    };
    talking?: boolean;
  }) {
    const [speaking, setSpeaking] = useState<boolean>(true);
    useEffect(() => {
      const interval = setInterval(() => {
        setSpeaking((prev) => !prev);
      }, faker.number.int({ min: 3, max: 10 }) * 1_000);

      return () => {
        clearInterval(interval);
      };
    }, []);
    return <CallAvatar {...props} speaking={speaking} />;
  },
};

export default meta;
