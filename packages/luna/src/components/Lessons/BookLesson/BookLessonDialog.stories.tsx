import { StoryObj, Meta } from "@storybook/react";
import { BookLessonDialog } from "@/components/Lessons/BookLesson";
import React, { useEffect, useState } from "react";
import { identity, range } from "lodash";
import { faker } from "@faker-js/faker/locale/ar";
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

export const Primary: Story = {
  args: {
    open: true,
    close: identity,
    tutorId: faker.number.int(),
    name: faker.person.fullName(),
    imageUrl: faker.image.urlPicsumPhotos({ width: 400, height: 400 }),
    bookedSlots: [],
    slots: range(5).map((idx) => ({
      id: 1,
      start: dayjs
        .utc()
        .add(idx + 1, "day")
        .set("hour", 10)
        .set("minutes", 0)
        .add(idx * 30, "minutes")
        .toISOString(),
      duration: 30,
      end: dayjs
        .utc()
        .add(idx + 2, "day")
        .set("hour", 10)
        .set("minutes", 0)
        .add(idx * 30, "minutes")
        .toISOString(),
      userId: 5,
      createdAt: faker.date.past().toISOString(),
      deleted: false,
      updatedAt: faker.date.past().toISOString(),
    })),
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
    bookedSlots: [],
    slots: range(5).map((idx) => ({
      id: 1,
      start: dayjs
        .utc()
        .add(idx + 1, "day")
        .set("hour", 10)
        .set("minutes", 0)
        .add(idx * 30, "minutes")
        .toISOString(),
      duration: 30,
      end: dayjs
        .utc()
        .add(idx + 2, "day")
        .set("hour", 10)
        .set("minutes", 0)
        .add(idx * 30, "minutes")
        .toISOString(),
      userId: 5,
      createdAt: faker.date.past().toISOString(),
      deleted: false,
      updatedAt: "",
    })),
    onBook() {
      alert("Lesson booked!!");
    },
  },
};

export const ConfirmationLoading: Story = {
  args: {
    open: true,
    close: identity,
    tutorId: faker.number.int(),
    name: faker.person.fullName(),
    imageUrl: faker.image.urlPicsumPhotos({ width: 400, height: 400 }),
    slots: range(5).map((idx) => ({
      id: 1,
      start: dayjs
        .utc()
        .add(idx + 1, "day")
        .set("hour", 10)
        .set("minutes", 0)
        .add(idx * 30, "minutes")
        .toISOString(),
      duration: 30,
      end: dayjs
        .utc()
        .add(idx + 2, "day")
        .set("hour", 10)
        .set("minutes", 0)
        .add(idx * 30, "minutes")
        .toISOString(),
      userId: 5,
      createdAt: faker.date.past().toISOString(),
      deleted: false,
      updatedAt: "",
    })),
    bookedSlots: [],
    confirmationLoading: true,
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
    slots: range(5).map((idx) => ({
      id: 1,
      start: dayjs
        .utc()
        .add(idx + 1, "day")
        .set("hour", 10)
        .set("minutes", 0)
        .add(idx * 30, "minutes")
        .toISOString(),
      duration: 30,
      end: dayjs
        .utc()
        .add(idx + 2, "day")
        .set("hour", 10)
        .set("minutes", 0)
        .add(idx * 30, "minutes")
        .toISOString(),
      userId: 5,
      createdAt: faker.date.past().toISOString(),
      deleted: false,
      updatedAt: "",
    })),
    bookedSlots: [],
    onBook() {
      alert("Lesson booked!!");
    },
  },
  render: (props) => {
    const [loading, setIsLoading] = useState(true);
    useEffect(() => {
      const id = setTimeout(() => {
        setIsLoading(false);
      }, 2_000);
      return () => clearTimeout(id);
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
    slots: [],
    bookedSlots: [],
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
    slots: [
      {
        id: 1,
        start: dayjs
          .utc()
          .add(0 + 1, "day")
          .set("minutes", 0)
          .set("hour", -2)
          .toISOString(),
        end: dayjs
          .utc()
          .add(0 + 2, "day")
          .set("minutes", 0)
          .set("hour", -2)
          .toISOString(),
        userId: 5,
        createdAt: faker.date.past().toISOString(),
        deleted: false,
        updatedAt: "",
      },
      {
        id: 1,
        start: dayjs
          .utc()
          .add(4, "day")
          .set("minutes", 0)
          .set("hour", -2)
          .add(1 * 30, "minutes")
          .toISOString(),
        end: dayjs
          .utc()
          .add(5, "day")
          .set("minutes", 0)
          .set("hour", -2)
          .add(1 * 30, "minutes")
          .toISOString(),
        userId: 5,
        createdAt: faker.date.past().toISOString(),
        deleted: false,
        updatedAt: "",
      },
    ],
    bookedSlots: [],
    onBook() {
      alert("Lesson booked!!");
    },
  },
};

export default meta;
