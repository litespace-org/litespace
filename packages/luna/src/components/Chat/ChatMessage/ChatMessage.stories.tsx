import type { Meta, StoryObj } from "@storybook/react";
import { ChatMessage } from "@/components/Chat/ChatMessage";
import { DarkStoryWrapper } from "@/internal/DarkWrapper";
import { faker } from "@faker-js/faker/locale/ar";
import React from "react";

type Component = typeof ChatMessage;

const meta: Meta<Component> = {
  component: ChatMessage,
  parameters: { layout: "centered" },
  decorators: [
    (Story) => {
      return (
        <div className="tw-max-w-[352px]">
          <Story />
        </div>
      );
    },
    DarkStoryWrapper,
  ],
};

export const OwnerShotMessage: StoryObj<Component> = {
  args: {
    text: faker.lorem.words(10),
    owner: true,
  },
};

export const OwnerLongMessage: StoryObj<Component> = {
  args: {
    text: faker.lorem.words(40),
    owner: true,
  },
};

export const ReceiverShotMessage: StoryObj<Component> = {
  args: {
    text: faker.lorem.words(10),
    owner: false,
  },
};

export const ReceiverLongMessage: StoryObj<Component> = {
  args: {
    text: faker.lorem.words(40),
    owner: false,
  },
};

export default meta;
