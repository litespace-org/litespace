import type { Meta, StoryObj } from "@storybook/react";
import { ChatMessage } from "@/components/Chat/ChatMessage";
import { DarkStoryWrapper } from "@/internal/DarkWrapper";
import { faker } from "@faker-js/faker/locale/ar";
import React from "react";
import { IMessage } from "@litespace/types";

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

const messageTemplate: IMessage.Self = {
  text: "",
  createdAt: "9:20 am",
  updatedAt: "9:20 am",
  read: true,
  roomId: 5,
  userId: 4,
  id: 1,
  deleted: false,
};

export const OwnerShortMessage: StoryObj<Component> = {
  args: {
    message: { ...messageTemplate, text: faker.lorem.words(10) },
    owner: true,
  },
};

export const OwnerLongMessage: StoryObj<Component> = {
  args: {
    message: { ...messageTemplate, text: faker.lorem.words(40) },
    owner: true,
  },
};

export const ReceiverShortMessage: StoryObj<Component> = {
  args: {
    message: { ...messageTemplate, text: faker.lorem.words(10) },
    owner: false,
  },
};

export const ReceiverLongMessage: StoryObj<Component> = {
  args: {
    message: { ...messageTemplate, text: faker.lorem.words(40) },
    owner: false,
  },
};

export default meta;
