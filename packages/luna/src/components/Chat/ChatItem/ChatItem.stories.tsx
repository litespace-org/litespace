import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { ChatItem } from "@/components/Chat/ChatItem";
import ar from "@/locales/ar-eg.json";
import { DarkStoryWrapper } from "@/internal/DarkWrapper";

type Component = typeof ChatItem;

const meta: Meta<Component> = {
  component: ChatItem,
  parameters: { layout: "centered" },
  decorators: [DarkStoryWrapper],
};

export const ChatItemPrimary: StoryObj<typeof ChatItem> = {
  args: {},
  render() {
    return (
      <div>
        <ChatItem
          onDelete={() => {}}
          onPin={() => {}}
          onMute={() => {}}
          chatId={5}
          name={ar["labels.name"]}
          message={ar["labels.name.placeholder"]}
          isTyping={false}
          unreadCount={0}
          image="2024-11/1732663561711-Copy of Untitled.png"
        />
      </div>
    );
  },
};

export const ChatItemActivePrimary: StoryObj<typeof ChatItem> = {
  args: {},
  render() {
    return (
      <div>
        <ChatItem
          onDelete={() => {}}
          onPin={() => {}}
          onMute={() => {}}
          isActive={true}
          chatId={5}
          name={ar["labels.name"]}
          message={ar["labels.name.placeholder"]}
          isTyping={false}
          unreadCount={0}
          image="2024-11/1732663561711-Copy of Untitled.png"
        />
      </div>
    );
  },
};

export const ChatItemUnread: StoryObj<typeof ChatItem> = {
  args: {},
  render() {
    return (
      <div>
        <ChatItem
          onDelete={() => {}}
          onPin={() => {}}
          onMute={() => {}}
          chatId={5}
          name={ar["labels.name"]}
          message={ar["labels.name.placeholder"]}
          isTyping={false}
          unreadCount={5}
          image="2024-11/1732663561711-Copy of Untitled.png"
        />
      </div>
    );
  },
};

export const ChatItemNotTypingWithUnread: StoryObj<typeof ChatItem> = {
  args: {},
  render() {
    return (
      <div>
        <ChatItem
          onDelete={() => {}}
          onPin={() => {}}
          onMute={() => {}}
          chatId={5}
          name={ar["labels.name"]}
          message={ar["labels.name.placeholder"]}
          isTyping={false}
          unreadCount={5}
          image="2024-11/1732663561711-Copy of Untitled.png"
        />
      </div>
    );
  },
};

export const ChatItemTypingWithUnread: StoryObj<typeof ChatItem> = {
  args: {},
  render() {
    return (
      <div>
        <ChatItem
          onDelete={() => {}}
          onPin={() => {}}
          onMute={() => {}}
          chatId={5}
          name={ar["labels.name"]}
          message={ar["labels.name.placeholder"]}
          isTyping={true}
          unreadCount={5}
          image="2024-11/1732663561711-Copy of Untitled.png"
        />
      </div>
    );
  },
};

export default meta;
