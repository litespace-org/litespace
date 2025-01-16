import { Meta, StoryObj } from "@storybook/react";
import { PastLessonsTable } from "@/components/Lessons/PastLessonsTable";
import { faker } from "@faker-js/faker/locale/ar";
import { range, sample } from "lodash";
import React from "react";

type Component = typeof PastLessonsTable;
type Story = StoryObj<Component>;

const meta: Meta<Component> = {
  title: "Lessons/PastLessontsTabe",
  component: PastLessonsTable,
  parameters: {
    layout: null,
  },
  decorators: [
    (Story) => (
      <div className="tw-p-6">
        <Story />
      </div>
    ),
  ],
};

const makeLesson = () => ({
  id: faker.number.int(),
  start: faker.date.past().toISOString(),
  duration: sample([15, 30]),
  currentMember: faker.number.int(),
  otherMember: {
    id: faker.number.int(),
    name: sample([faker.person.fullName(), null])!,
    imageUrl: sample([
      faker.image.urlPicsumPhotos({
        width: 400,
        height: 400,
      }),
      null,
    ])!,
  },
  peerId: faker.number.int(),
});

export const UserIsTutor: Story = {
  args: {
    lessons: range(10).map(() => makeLesson()),
    tutorsRoute: "/",
    isTutor: true,
    loading: false,
    error: false,
    onSendMessage: () => alert("sending message..."),
    retry: () => alert("retrying..."),
  },
};

export const UserIsTutorManager: Story = {
  args: {
    lessons: range(10).map(() => makeLesson()),
    tutorsRoute: "/",
    isTutor: true,
    loading: false,
    error: false,
    onSendMessage: () => alert("sending message..."),
    retry: () => alert("retrying..."),
  },
};

export const SendMessageBtnLoading: Story = {
  args: {
    lessons: range(10).map(() => makeLesson()),
    tutorsRoute: "/",
    isTutor: true,
    loading: false,
    error: false,
    onSendMessage: () => alert("sending message..."),
    retry: () => alert("retrying..."),
  },
};

export const SendMessageBtnDisabled: Story = {
  args: {
    lessons: range(10).map(() => makeLesson()),
    tutorsRoute: "/",
    isTutor: true,
    loading: false,
    error: false,
    onSendMessage: () => alert("sending message..."),
    retry: () => alert("retrying..."),
  },
};

export const SendMessageBtnDisabledOnLoading: Story = {
  args: {
    lessons: range(10).map(() => makeLesson()),
    tutorsRoute: "/",
    isTutor: true,
    loading: false,
    error: false,
    onSendMessage: () => alert("sending message..."),
    retry: () => alert("retrying..."),
  },
};

export const UserIsStudent: Story = {
  args: {
    lessons: range(10).map(() => makeLesson()),
    onRebook(tutorId) {
      alert(`Rebook with tutor id ${tutorId}`);
    },
    tutorsRoute: "/",
    isTutor: false,
    loading: false,
    error: false,
    retry: () => alert("retrying..."),
  },
};

export const Loading: Story = {
  args: {
    lessons: range(10).map(() => makeLesson()),
    onRebook(tutorId) {
      alert(`Rebook with tutor id ${tutorId}`);
    },
    tutorsRoute: "/",
    loading: true,
  },
};

export const Error: Story = {
  args: {
    lessons: range(10).map(() => makeLesson()),
    onRebook(tutorId) {
      alert(`Rebook with tutor id ${tutorId}`);
    },
    tutorsRoute: "/",
    error: true,
    retry: () => alert("retry"),
  },
};

export const Empty: Story = {
  args: {
    lessons: [],
    tutorsRoute: "/",
  },
};

export default meta;
