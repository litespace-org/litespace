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
    slots: range(5).map((idx) => {
      const start = dayjs
        .utc()
        .add(1, "day")
        .set("hour", 10)
        .set("minutes", 0)
        .add(idx * 30, "minutes");
      return {
        id: faker.number.int(),
        start: start.toISOString(),
        end: start.add(30, "minutes").toISOString(),
      };
    }),
    notice: 0,
    onBook() {
      alert("Lesson booked!!");
    },
  },
};

export const LoadingSlots: Story = {
  args: {
    open: true,
    loading: true,
    close: identity,
    tutorId: faker.number.int(),
    name: faker.person.fullName(),
    imageUrl: faker.image.urlPicsumPhotos({ width: 400, height: 400 }),
    slots: range(5).map((idx) => {
      const start = dayjs
        .utc()
        .add(1, "day")
        .set("hour", 10)
        .set("minutes", 0)
        .add(idx * 30, "minutes");
      return {
        id: faker.number.int(),
        start: start.toISOString(),
        end: start.add(30, "minutes").toISOString(),
      };
    }),
    notice: 0,
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
    slots: range(5).map((idx) => {
      const start = dayjs
        .utc()
        .add(1, "day")
        .set("hour", 10)
        .set("minutes", 0)
        .add(idx * 30, "minutes");
      return {
        id: faker.number.int(),
        start: start.toISOString(),
        end: start.add(30, "minutes").toISOString(),
      };
    }),
    notice: 0,
    confirmationLoading: true,
    onBook() {
      alert("Lesson booked!!");
    },
  },
};

export const LoadingThenShowingSlots: Story = {
  args: {
    open: true,
    loading: true,
    close: identity,
    tutorId: faker.number.int(),
    name: faker.person.fullName(),
    imageUrl: faker.image.urlPicsumPhotos({ width: 400, height: 400 }),
    slots: range(5).map((idx) => {
      const start = dayjs
        .utc()
        .add(1, "day")
        .set("hour", 10)
        .set("minutes", 0)
        .add(idx * 30, "minutes");
      return {
        id: faker.number.int(),
        start: start.toISOString(),
        end: start.add(30, "minutes").toISOString(),
      };
    }),
    notice: 0,
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

export const EmptySlots: Story = {
  args: {
    open: true,
    close: identity,
    tutorId: faker.number.int(),
    name: faker.person.fullName(),
    imageUrl: faker.image.urlPicsumPhotos({ width: 400, height: 400 }),
    slots: range(5).map((idx) => {
      const start = dayjs
        .utc()
        .add(1, "day")
        .set("hour", 10)
        .set("minutes", 0)
        .add(idx * 30, "minutes");
      return {
        id: faker.number.int(),
        start: start.toISOString(),
        end: start.add(30, "minutes").toISOString(),
      };
    }),
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
    slots: range(5).map((idx) => {
      const start = dayjs
        .utc()
        .add(1, "day")
        .startOf("hour")
        .add(1, "hour")
        .add(idx * 30, "minutes");
      return {
        id: faker.number.int(),
        start: start.toISOString(),
        end: start.add(30, "minutes").toISOString(),
      };
    }),
    notice: 0,
    onBook() {
      alert("Lesson booked!!");
    },
  },
};

export default meta;
