import type { Meta, StoryObj } from "@storybook/react";
import { UserAvatar } from "@/components/Session/UserAvatar";
import { faker } from "@faker-js/faker/locale/ar";
import { DarkStoryWrapper } from "@/internal/DarkWrapper";
import React, { useEffect, useState } from "react";

type Component = typeof UserAvatar;

const meta: Meta<Component> = {
  title: "Session/UserAvatar",
  component: UserAvatar,
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

export const Speaking2: StoryObj<Component> = {
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
      const interval = setInterval(
        () => {
          setSpeaking((prev) => !prev);
        },
        faker.number.int({ min: 3, max: 10 }) * 1_000
      );

      return () => {
        clearInterval(interval);
      };
    }, []);
    return <UserAvatar {...props} speaking={speaking} />;
  },
};

export default meta;
