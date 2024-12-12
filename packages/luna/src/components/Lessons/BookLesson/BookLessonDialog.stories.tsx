import { StoryObj, Meta } from "@storybook/react";
import { BookLessonDialog } from "@/components/Lessons/BookLesson";
import React, { useEffect, useState } from "react";
import { identity, range } from "lodash";
import { faker } from "@faker-js/faker/locale/ar";
import { IDate, IRule } from "@litespace/types";
import dayjs from "@/lib/dayjs";

type Component = typeof BookLessonDialog;
type Story = StoryObj<Component>;

const meta: Meta<Component> = {
  title: "Lessons/BookLessonDialog",
  component: BookLessonDialog,
  parameters: {
    layout: null,
  },
  decorators: [
    (Story) => (
      <div className="tw-p-5">
        <Story />
      </div>
    ),
  ],
};

const makeRule = (id: number): IRule.Self => ({
  id,
  userId: faker.number.int(),
  title: faker.lorem.words(),
  frequency: IRule.Frequency.Daily,
  start: dayjs.utc().subtract(1, "day").toISOString(),
  end: dayjs.utc().add(1, "month").toISOString(),
  duration: 8 * 60,
  time: "10:00",
  weekdays: [
    IDate.Weekday.Sunday,
    IDate.Weekday.Monday,
    IDate.Weekday.Tuesday,
    IDate.Weekday.Wednesday,
    IDate.Weekday.Thursday,
  ],
  monthday: null,
  activated: true,
  deleted: false,
  createAt: faker.date.past().toISOString(),
  updatedAt: faker.date.past().toISOString(),
});

const sharedRuleValues = {
  id: 1,
  userId: faker.number.int(),
  title: faker.lorem.words(),
  monthday: null,
  activated: true,
  deleted: false,
  createAt: faker.date.past().toISOString(),
  updatedAt: faker.date.past().toISOString(),
};

export const Primary: Story = {
  args: {
    open: true,
    close: identity,
    tutorId: faker.number.int(),
    name: faker.person.fullName(),
    imageUrl: faker.image.urlPicsumPhotos({ width: 400, height: 400 }),
    rules: [makeRule(1)],
    slots: range(5).map((idx) => ({
      ruleId: 1,
      start: dayjs
        .utc()
        .add(1, "day")
        .set("hour", 10)
        .set("minutes", 0)
        .add(idx * 30, "minutes")
        .toISOString(),
      duration: 30,
    })),
    notice: 0,
    onBook() {
      alert("Lesson booked!!");
    },
  },
};

export const LoadingRules: Story = {
  args: {
    open: true,
    loading: true,
    close: identity,
    tutorId: faker.number.int(),
    name: faker.person.fullName(),
    imageUrl: faker.image.urlPicsumPhotos({ width: 400, height: 400 }),
    rules: [makeRule(1)],
    slots: range(5).map((idx) => ({
      ruleId: 1,
      start: dayjs
        .utc()
        .add(1, "day")
        .set("hour", 10)
        .set("minutes", 0)
        .add(idx * 30, "minutes")
        .toISOString(),
      duration: 30,
    })),
    notice: 0,
    onBook() {
      alert("Lesson booked!!");
    },
  },
};

export const LoadingThenShowingRules: Story = {
  args: {
    open: true,
    loading: true,
    close: identity,
    tutorId: faker.number.int(),
    name: faker.person.fullName(),
    imageUrl: faker.image.urlPicsumPhotos({ width: 400, height: 400 }),
    rules: [makeRule(1)],
    slots: range(5).map((idx) => ({
      ruleId: 1,
      start: dayjs
        .utc()
        .add(1, "day")
        .set("hour", 10)
        .set("minutes", 0)
        .add(idx * 30, "minutes")
        .toISOString(),
      duration: 30,
    })),
    notice: 0,
    onBook() {
      alert("Lesson booked!!");
    },
  },
  render: (props) => {
    const [loading, setIsLoading] = useState(true);
    useEffect(() => {
      setTimeout(() => {
        setIsLoading(false);
      }, 2_000);
    }, []);
    return <BookLessonDialog {...props} loading={loading} />;
  },
};

export const EmptyRules: Story = {
  args: {
    open: true,
    close: identity,
    tutorId: faker.number.int(),
    name: faker.person.fullName(),
    imageUrl: faker.image.urlPicsumPhotos({ width: 400, height: 400 }),
    rules: [],
    slots: range(5).map((idx) => ({
      ruleId: 1,
      start: dayjs
        .utc()
        .add(1, "day")
        .set("hour", 10)
        .set("minutes", 0)
        .add(idx * 30, "minutes")
        .toISOString(),
      duration: 30,
    })),
    notice: 0,
    onBook() {
      alert("Lesson booked!!");
    },
  },
};

export const WithNoticePeriod: Story = {
  args: {
    open: true,
    close: identity,
    tutorId: faker.number.int(),
    name: faker.person.fullName(),
    imageUrl: faker.image.urlPicsumPhotos({ width: 400, height: 400 }),
    rules: [
      {
        start: dayjs.utc().subtract(1, "day").toISOString(),
        end: dayjs.utc().add(1, "month").toISOString(),
        frequency: IRule.Frequency.Daily,
        duration: 8 * 60,
        time: dayjs.utc().startOf("hour").format("HH:mm"),
        weekdays: [],
        ...sharedRuleValues,
      },
    ],
    slots: [],
    notice: 3 * 60,
    onBook() {
      alert("Lesson booked!!");
    },
  },
};

export const WithLongNoticePeriod: Story = {
  args: {
    open: true,
    close: identity,
    tutorId: faker.number.int(),
    name: faker.person.fullName(),
    imageUrl: faker.image.urlPicsumPhotos({ width: 400, height: 400 }),
    rules: [
      {
        start: dayjs.utc().subtract(1, "day").toISOString(),
        end: dayjs.utc().add(1, "month").toISOString(),
        frequency: IRule.Frequency.Daily,
        duration: 8 * 60,
        time: dayjs.utc().startOf("hour").format("HH:mm"),
        weekdays: [],
        ...sharedRuleValues,
      },
    ],
    slots: [],
    notice: 8 * 60,
    onBook() {
      alert("Lesson booked!!");
    },
  },
};

export const SlotsBelongsToTwoSeperateDays: Story = {
  args: {
    open: true,
    close: identity,
    tutorId: faker.number.int(),
    name: faker.person.fullName(),
    imageUrl: faker.image.urlPicsumPhotos({ width: 400, height: 400 }),
    rules: [
      {
        start: dayjs.utc().subtract(1, "day").toISOString(),
        end: dayjs.utc().add(1, "month").toISOString(),
        frequency: IRule.Frequency.Daily,
        duration: 8 * 60,
        time: dayjs.utc().startOf("hour").format("HH:mm"),
        weekdays: [],
        ...sharedRuleValues,
      },
    ],
    slots: [
      {
        ruleId: 1,
        start: dayjs.utc().startOf("hour").add(1, "hour").toISOString(),
        duration: 30,
      },
      {
        ruleId: 1,
        start: dayjs
          .utc()
          .add(1, "day")
          .startOf("hour")
          .add(1, "hour")
          .toISOString(),
        duration: 30,
      },
    ],
    notice: 0,
    onBook() {
      alert("Lesson booked!!");
    },
  },
};

export default meta;
