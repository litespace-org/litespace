import React from "react";
import { Meta, StoryObj } from "@storybook/react";
import { ChatSummary } from "@/components/Chat/ChatSummary/ChatSummary";
import { faker } from "@faker-js/faker/locale/ar";
import { range } from "lodash";

type Story = StoryObj<typeof ChatSummary>;

const meta: Meta<typeof ChatSummary> = {
  title: "Components/Chat/ChatSummary",
  component: ChatSummary,
  decorators: [
    (Story) => (
      <div className="w-[312px]">
        <Story />
      </div>
    ),
  ],
};

export default meta;

const makeRoom = (isLongMsgWord: boolean = false) => ({
  id: Math.floor(Math.random() * 100),
  otherMember: {
    id: Math.floor(Math.random() * 100),
    name: faker.person.fullName(),
    image: faker.image.urlPicsumPhotos({ width: 400, height: 400 }),
    online: false,
  },
  url: "/",
  message: isLongMsgWord
    ? faker.internet.email({ firstName: "absdefghigklmnopqrst" })
    : faker.lorem.words(1),
  sentAt: faker.date.past().toISOString(),
  read: faker.datatype.boolean(),
});

export const Primary: Story = {
  args: {
    rooms: range(4).map(() => makeRoom()),
    chatsUrl: "/",
  },
};

export const LargeWords: Story = {
  args: {
    rooms: range(4).map(() => makeRoom(true)),
    chatsUrl: "/",
  },
};

export const Loading: Story = {
  args: {
    rooms: range(4).map(() => makeRoom()),
    chatsUrl: "/",
    loading: true,
  },
};

export const Error: Story = {
  args: {
    rooms: range(4).map(() => makeRoom()),
    chatsUrl: "/",
    error: true,
    retry: () => alert("retry"),
  },
};

export const Empty: Story = {
  args: {
    rooms: [],
    chatsUrl: "/",
  },
};
