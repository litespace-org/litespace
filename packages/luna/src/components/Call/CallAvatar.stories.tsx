import type { Meta, StoryObj } from "@storybook/react";
import { CallAvatar } from "@/components/Call/CallAvatar";
import { faker } from "@faker-js/faker/locale/ar";
import { DarkStoryWrapper } from "@/internal/DarkWrapper";
import React, { useEffect, useState } from "react";

type Component = typeof CallAvatar;

const meta: Meta<Component> = {
  title: "CallAvatar",
  component: CallAvatar,
  parameters: { layout: "centered" },
  decorators: [DarkStoryWrapper],
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
    const [talking, setTalking] = useState<boolean>(true);
    useEffect(() => {
      const interval = setInterval(() => {
        setTalking((prev) => !prev);
      }, faker.number.int({ min: 1, max: 3 }) * 1_000);

      return () => {
        clearInterval(interval);
      };
    }, []);
    return <CallAvatar {...props} talking={talking} />;
  },
};

export default meta;
