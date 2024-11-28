import type { Meta, StoryObj } from "@storybook/react";
import { ChatGroup } from "@/components/Chat/ChatGroup";
import { DarkStoryWrapper } from "@/internal/DarkWrapper";
import { faker } from "@faker-js/faker/locale/ar";
import React from "react";
import { ChatBubbleVariant } from "@/components/Chat/ChatBubble";
import dayjs from "dayjs";

type Component = typeof ChatGroup;

const meta: Meta<Component> = {
  component: ChatGroup,
  parameters: { layout: "centered" },
  decorators: [
    (Story) => {
      return (
        <div className="tw-max-w-[3102px]">
          <Story />
        </div>
      );
    },
    DarkStoryWrapper,
  ],
};

export const Primary: StoryObj<Component> = {
  args: {
    image: "https://picsum.photos/700",
    name: faker.person.fullName(),
    messages: [
      {
        id: 1,
        deleted: false,
        roomId: 4,
        userId: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        read: false,
        text: faker.lorem.words(10),
      },
      {
        id: 2,
        deleted: false,
        roomId: 4,
        userId: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        read: false,
        text: faker.lorem.words(10),
      },
      {
        id: 3,
        deleted: false,
        roomId: 4,
        userId: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        read: false,
        text: faker.lorem.words(10),
      },
    ],
    variant: ChatBubbleVariant.CurrentUser,
    sentAt: dayjs().format("h:mm a"),
    userId: 1,
  },
};

export const PrimaryOtherUser: StoryObj<Component> = {
  args: {
    image: "https://picsum.photos/700",
    name: faker.person.fullName(),
    messages: [
      {
        id: 1,
        deleted: false,
        roomId: 4,
        userId: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        read: false,
        text: faker.lorem.words(10),
      },
      {
        id: 2,
        deleted: false,
        roomId: 4,
        userId: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        read: false,
        text: faker.lorem.words(10),
      },
      {
        id: 3,
        deleted: false,
        roomId: 4,
        userId: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        read: false,
        text: faker.lorem.words(10),
      },
    ],
    variant: ChatBubbleVariant.CurrentUser,
    sentAt: dayjs().format("h:mm a"),
    userId: 1,
  },
};

export const PrimaryOneMessage: StoryObj<Component> = {
  args: {
    image: "https://picsum.photos/700",
    name: faker.person.fullName(),
    messages: [
      {
        id: 1,
        deleted: false,
        roomId: 4,
        userId: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        read: false,
        text: faker.lorem.words(10),
      },
    ],
    variant: ChatBubbleVariant.CurrentUser,
    sentAt: dayjs().format("h:mm a"),
    userId: 1,
  },
};

export const PrimaryOtherUserOneMessage: StoryObj<Component> = {
  args: {
    image: "https://picsum.photos/700",
    name: faker.person.fullName(),
    messages: [
      {
        id: 1,
        deleted: false,
        roomId: 4,
        userId: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        read: false,
        text: faker.lorem.words(10),
      },
    ],
    variant: ChatBubbleVariant.OtherUser,
    sentAt: dayjs().format("h:mm a"),
    userId: 1,
  },
};
export default meta;
