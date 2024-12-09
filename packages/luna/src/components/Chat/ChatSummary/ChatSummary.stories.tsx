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
      <div className="tw-w-[312px]">
        <Story />
      </div>
    ),
  ],
};

export default meta;

const makeRoom = () => ({
  id: Math.floor(Math.random() * 100),
  url: "/",
  name: faker.person.fullName(),
  image: faker.image.urlPicsumPhotos({ width: 400, height: 400 }),
  message: faker.lorem.words(10),
  sentAt: faker.date.past().toISOString(),
  read: faker.datatype.boolean(),
});

export const Primary: Story = {
  args: {
    rooms: range(4).map(() => makeRoom()),
    chatsUrl: "/",
  },
};

export const Empty: Story = {
  args: {
    rooms: [],
    chatsUrl: "/",
  },
};
