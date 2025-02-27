import type { Meta, StoryObj } from "@storybook/react";
import { ChatRoom } from "@/components/Chat/ChatRoom";
import { DarkStoryWrapper } from "@/internal/DarkWrapper";
import { faker } from "@faker-js/faker/locale/ar";
import React from "react";

type Component = typeof ChatRoom;

const meta: Meta<Component> = {
  component: ChatRoom,
  parameters: { layout: "centered" },
  decorators: [
    (Story) => {
      return (
        <div className="max-w-[352px]">
          <Story />
        </div>
      );
    },
    DarkStoryWrapper,
  ],
};

export const Primary: StoryObj<Component> = {
  args: {
    actionable: true,
    userId: 1,
    togglePin: () => {},
    toggleMute: () => {},
    select: () => {},
    name: faker.person.fullName(),
    message: faker.lorem.words(5),
    typing: false,
    unreadCount: 0,
    imageUrl: "https://picsum.photos/700",
  },
};

export const Online: StoryObj<Component> = {
  args: {
    userId: 1,
    actionable: true,
    togglePin: () => {},
    toggleMute: () => {},
    select: () => {},
    name: faker.person.fullName(),
    message: faker.lorem.words(5),
    typing: false,
    unreadCount: 0,
    imageUrl: "https://picsum.photos/700",
    owner: true,
    messageState: "sent",
    online: true,
  },
};

export const FirstMessage: StoryObj<Component> = {
  args: {
    userId: 1,
    actionable: false,
    togglePin: () => {},
    toggleMute: () => {},
    select: () => {},
    name: faker.person.fullName(),
    message: faker.lorem.words(5),
    typing: false,
    unreadCount: 0,
    imageUrl: "https://picsum.photos/700",
    owner: true,
    messageState: "sent",
    online: true,
  },
};

export const FirstMessageActive: StoryObj<Component> = {
  args: {
    userId: 1,
    actionable: false,
    togglePin: () => {},
    toggleMute: () => {},
    select: () => {},
    name: faker.person.fullName(),
    message: faker.lorem.words(5),
    typing: false,
    unreadCount: 0,
    imageUrl: "https://picsum.photos/700",
    owner: true,
    active: true,
    messageState: "sent",
    online: true,
  },
};

export const Active: StoryObj<Component> = {
  args: {
    userId: 1,
    togglePin: () => {},
    actionable: true,
    toggleMute: () => {},
    select: () => {},
    name: faker.person.fullName(),
    message: faker.lorem.words(5),
    typing: false,
    active: true,
    unreadCount: 0,
    imageUrl: "https://picsum.photos/700",
  },
};

export const ActiveTyping: StoryObj<Component> = {
  args: {
    userId: 1,
    togglePin: () => {},
    toggleMute: () => {},
    select: () => {},
    actionable: true,
    name: faker.person.fullName(),
    message: faker.lorem.words(5),
    typing: true,
    active: true,
    unreadCount: 0,
    imageUrl: "https://picsum.photos/700",
  },
};

export const ActiveMuted: StoryObj<Component> = {
  args: {
    userId: 1,
    togglePin: () => {},
    toggleMute: () => {},
    select: () => {},
    actionable: true,
    name: faker.person.fullName(),
    message: faker.lorem.words(5),
    typing: true,
    muted: true,
    active: true,
    unreadCount: 0,
    imageUrl: "https://picsum.photos/700",
  },
};

export const Muted: StoryObj<Component> = {
  args: {
    userId: 1,
    togglePin: () => {},
    actionable: true,
    toggleMute: () => {},
    select: () => {},
    name: faker.person.fullName(),
    message: faker.lorem.words(5),
    typing: true,
    active: false,
    muted: true,
    unreadCount: 0,
    imageUrl: "https://picsum.photos/700",
  },
};

export const Typing: StoryObj<Component> = {
  args: {
    userId: 1,
    togglePin: () => {},
    actionable: true,
    toggleMute: () => {},
    select: () => {},
    name: faker.person.fullName(),
    message: faker.lorem.words(5),
    typing: true,
    active: false,
    unreadCount: 0,
    imageUrl: "https://picsum.photos/700",
  },
};

export const UnreadMessages: StoryObj<Component> = {
  args: {
    userId: 1,
    togglePin: () => {},
    actionable: true,
    toggleMute: () => {},
    select: () => {},
    name: faker.person.fullName(),
    message: faker.lorem.words(5),
    typing: false,
    active: false,
    unreadCount: 20,
    imageUrl: "https://picsum.photos/700",
  },
};

export const Sent: StoryObj<Component> = {
  args: {
    userId: 1,
    togglePin: () => {},
    actionable: true,
    toggleMute: () => {},
    select: () => {},
    name: faker.person.fullName(),
    message: faker.lorem.words(5),
    typing: false,
    unreadCount: 0,
    imageUrl: "https://picsum.photos/700",
    owner: true,
    messageState: "sent",
  },
};

export const Seen: StoryObj<Component> = {
  args: {
    userId: 1,
    owner: true,
    actionable: true,
    messageState: "seen",
    togglePin: () => {},
    toggleMute: () => {},
    select: () => {},
    name: faker.person.fullName(),
    message: faker.lorem.words(5),
    typing: false,
    unreadCount: 0,
    imageUrl: "https://picsum.photos/700",
  },
};

export const LongMessages1: StoryObj<Component> = {
  args: {
    userId: 1,
    actionable: true,
    togglePin: () => {},
    toggleMute: () => {},
    select: () => {},
    name: faker.person.fullName(),
    message: faker.lorem.words(20),
    typing: false,
    active: false,
    unreadCount: 20,
    imageUrl: "https://picsum.photos/700",
  },
};

export const LongMessages2: StoryObj<Component> = {
  args: {
    userId: 1,
    togglePin: () => {},
    actionable: true,
    toggleMute: () => {},
    select: () => {},
    name: faker.person.fullName(),
    message: faker.lorem.words(20),
    typing: false,
    active: false,
    unreadCount: 0,
    imageUrl: "https://picsum.photos/700",
  },
};

export default meta;
