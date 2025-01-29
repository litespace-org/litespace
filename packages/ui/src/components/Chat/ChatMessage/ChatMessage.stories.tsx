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
        <div className="tw-max-w-[400px]">
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
    firstMessage: true,
    message: { ...messageTemplate, text: faker.lorem.words(10) },
    owner: true,
  },
};

export const OwnerLongMessage: StoryObj<Component> = {
  args: {
    message: { ...messageTemplate, text: faker.lorem.words(40) },
    firstMessage: true,
    owner: true,
  },
};

export const Sent: StoryObj<Component> = {
  args: {
    message: { ...messageTemplate, text: faker.lorem.words(40) },
    firstMessage: true,
    owner: true,
    messageState: "sent",
  },
};

export const Seen: StoryObj<Component> = {
  args: {
    message: { ...messageTemplate, text: faker.lorem.words(40) },
    firstMessage: true,
    owner: true,
    messageState: "seen",
  },
};

export const PendingMessage: StoryObj<Component> = {
  args: {
    message: { ...messageTemplate, text: faker.lorem.words(10) },
    firstMessage: true,
    owner: true,
    pending: true,
    retry: () => alert("retry sending"),
  },
};

export const ErrorMessage: StoryObj<Component> = {
  args: {
    message: { ...messageTemplate, text: faker.lorem.words(5) },
    firstMessage: true,
    owner: true,
    error: true,
    retry: () => alert("retry sending"),
  },
};

export const ErrorLongMessage: StoryObj<Component> = {
  args: {
    message: { ...messageTemplate, text: faker.lorem.words(40) },
    firstMessage: true,
    owner: true,
    error: true,
    retry: () => alert("retry sending"),
  },
};

export const ReceiverShortMessage: StoryObj<Component> = {
  args: {
    message: { ...messageTemplate, text: faker.lorem.words(10) },
    firstMessage: true,
    owner: false,
  },
};

export const ReceiverLongMessage: StoryObj<Component> = {
  args: {
    message: { ...messageTemplate, text: faker.lorem.words(40) },
    firstMessage: true,
    owner: false,
  },
};

export default meta;
