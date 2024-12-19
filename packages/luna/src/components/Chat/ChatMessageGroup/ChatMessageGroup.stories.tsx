import type { Meta, StoryObj } from "@storybook/react";
import { ChatMessageGroup } from "@/components/Chat/ChatMessageGroup";
import { DarkStoryWrapper } from "@/internal/DarkWrapper";
import { faker } from "@faker-js/faker/locale/ar";
import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import { range } from "lodash";

type Component = typeof ChatMessageGroup;

function messages(count: number) {
  return range(count).map((idx) => ({
    id: idx,
    text: faker.lorem.words({ min: 5, max: 50 }),
  }));
}

const meta: Meta<Component> = {
  component: ChatMessageGroup,
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

export const OwnerOneMessage: StoryObj<Component> = {
  args: {
    sender: {
      image: "https://picsum.photos/700",
      name: faker.person.fullName(),
      userId: 1,
    },
    messages: messages(1),
    owner: true,
    sentAt: dayjs().toISOString(),
  },
};

export const OwnerMultipleMessages: StoryObj<Component> = {
  args: {
    sender: {
      name: faker.person.fullName(),
      userId: 1,
      image: "https://picsum.photos/700",
    },
    messages: messages(6),
    owner: true,
    sentAt: dayjs().toISOString(),
  },
};

export const ReceiverOneMessage: StoryObj<Component> = {
  args: {
    sender: {
      userId: 1,
      image: "https://picsum.photos/700",
      name: faker.person.fullName(),
    },
    messages: messages(1),
    owner: false,
    sentAt: dayjs().toISOString(),
  },
};

export const ReceiverMultipleMessages: StoryObj<Component> = {
  args: {
    sender: {
      userId: 1,
      image: "https://picsum.photos/700",
      name: faker.person.fullName(),
    },
    messages: messages(6),
    owner: false,
    sentAt: dayjs().toISOString(),
  },
};

export const MessagingSimulation: StoryObj<Component> = {
  args: {
    sender: {
      image: "https://picsum.photos/700",
      name: faker.person.fullName(),
      userId: 1,
    },
    messages: messages(6),
    owner: false,
    sentAt: dayjs().toISOString(),
  },
  render(props) {
    const [messages, setMessages] = useState(props.messages);

    useEffect(() => {
      const interval = setInterval(() => {
        const seed = Math.random();
        if (seed >= 0.5)
          return setMessages((prev) => [
            ...prev,
            {
              id: prev.length,
              text: faker.lorem.words({ min: 10, max: 50 }),
            },
          ]);

        return setMessages((prev) => {
          const seed = faker.number.int({ min: 0, max: prev.length });
          return prev.filter((_, idx) => idx !== seed);
        });
      }, 1_000);
      return () => {
        clearInterval(interval);
      };
    }, []);

    return <ChatMessageGroup {...props} messages={messages} />;
  },
};

export default meta;
