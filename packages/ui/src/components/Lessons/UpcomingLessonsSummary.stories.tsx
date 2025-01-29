import { Meta, StoryObj } from "@storybook/react";
import { UpcomingLessonsSummary } from "@/components/Lessons/UpcomingLessonsSummary";
import { faker } from "@faker-js/faker/locale/ar";
import { range } from "lodash";
import React from "react";

type Story = StoryObj<typeof UpcomingLessonsSummary>;

const meta: Meta<typeof UpcomingLessonsSummary> = {
  title: "Lessons/UpcomingLessonsSummary",
  component: UpcomingLessonsSummary,
  decorators: [
    (Story) => (
      <div className="tw-w-[312px]">
        <Story />
      </div>
    ),
  ],
};

export default meta;

const makelesson = () => ({
  start: faker.date.future().toISOString(),
  end: faker.date.future().toISOString(),
  name: faker.person.fullName(),
  imgUrl: faker.image.urlPicsumPhotos({ width: 100, height: 100 }),
  userId: faker.number.int(),
  url: "/",
});

export const Primary: Story = {
  args: {
    lessons: range(4).map(() => makelesson()),
  },
};

export const Loading: Story = {
  args: {
    lessons: range(4).map(() => makelesson()),
    loading: true,
  },
};

export const Error: Story = {
  args: {
    lessons: range(4).map(() => makelesson()),
    error: true,
    retry: () => alert("retry"),
  },
};

export const Empty: Story = {
  args: {
    lessons: [],
  },
};
