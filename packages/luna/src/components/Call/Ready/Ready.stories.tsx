import type { Meta, StoryObj } from "@storybook/react";
import { Ready } from "@/components/Call/Ready";
import { DarkStoryWrapper } from "@/internal/DarkWrapper";
import React from "react";
import { faker } from "@faker-js/faker/locale/ar";
import { IUser } from "@litespace/types";
type Component = typeof Ready;

const meta: Meta<Component> = {
  component: Ready,
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

export const EmptyCall: StoryObj<Component> = {
  args: {
    users: [],
    join: () => {},
    hasMic: true,
  },
};

export const PreCallStudent: StoryObj<Component> = {
  args: {
    users: [
      {
        id: 1,
        name: faker.person.fullName(),
        imageUrl: "https://picsum.photos/400",
        role: IUser.Role.Tutor,
      },
    ],
    join: () => {},
    hasMic: true,
  },
};

export const PreCallTutor: StoryObj<Component> = {
  args: {
    users: [
      {
        id: 1,
        name: faker.person.fullName(),
        imageUrl: "https://picsum.photos/400",
        role: IUser.Role.Student,
      },
    ],
    join: () => {},
    hasMic: true,
  },
};

export const NoMic: StoryObj<Component> = {
  args: {
    users: [
      {
        id: 1,
        name: faker.person.fullName(),
        imageUrl: "https://picsum.photos/400",
        role: IUser.Role.Student,
      },
    ],
    join: () => {},
    hasMic: false,
  },
};

export default meta;
