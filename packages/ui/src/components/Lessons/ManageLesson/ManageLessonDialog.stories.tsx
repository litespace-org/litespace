import { StoryObj, Meta } from "@storybook/react";
import { ManageLessonDialog } from "@/components/Lessons/ManageLesson";
import React, { useEffect, useState } from "react";
import { identity, range } from "lodash";
import { faker } from "@faker-js/faker/locale/ar";
import dayjs from "@/lib/dayjs";

type Component = typeof ManageLessonDialog;
type Story = StoryObj<Component>;

const meta: Meta<Component> = {
  title: "Lessons/ManageLessonDialog",
  component: ManageLessonDialog,
  parameters: {
    layout: null,
  },
  decorators: [
    (Story) => (
      <div className="p-5">
        <Story />
      </div>
    ),
  ],
};

function makeSlots(count: number) {
  return range(count).map((idx) => {
    const start = dayjs
      .utc()
      .add(idx + 1, "day")
      .set("hour", 10)
      .set("minutes", 0)
      .add(idx * 30, "minutes");

    return {
      id: idx + 1,
      start: start.toISOString(),
      end: start.add(2, "hours").toISOString(),
      userId: 5,
      createdAt: faker.date.past().toISOString(),
      deleted: false,
      updatedAt: faker.date.past().toISOString(),
    };
  });
}

export const Primary: Story = {
  args: {
    open: true,
    close: identity,
    tutorId: faker.number.int(),
    name: faker.person.fullName(),
    imageUrl: faker.image.urlPicsumPhotos({ width: 400, height: 400 }),
    bookedSlots: [],
    slots: makeSlots(5),
    onSubmit() {
      alert("Lesson booked!!");
    },
  },
};

export const WithBookedSlots: Story = {
  args: {
    open: true,
    close: identity,
    tutorId: faker.number.int(),
    name: faker.person.fullName(),
    imageUrl: faker.image.urlPicsumPhotos({ width: 400, height: 400 }),
    slots: [
      {
        id: 1,
        start: dayjs.utc().startOf("day").toISOString(),
        end: dayjs.utc().startOf("day").add(4, "hours").toISOString(),
        createdAt: faker.date.past().toISOString(),
        updatedAt: faker.date.past().toISOString(),
        deleted: false,
        userId: 4,
      },
    ],
    bookedSlots: [
      {
        parent: 1,
        start: dayjs.utc().startOf("day").toISOString(),
        end: dayjs.utc().startOf("day").add(30, "minutes").toISOString(),
      },
      {
        parent: 1,
        start: dayjs.utc().startOf("day").add(1, "hour").toISOString(),
        end: dayjs.utc().startOf("day").add(1.5, "hours").toISOString(),
      },
    ],
    onSubmit() {
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
    bookedSlots: [],
    slots: [],
    onSubmit() {
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
    slots: makeSlots(5),
    bookedSlots: [],
    confirmationLoading: true,
    onSubmit() {
      alert("Lesson booked!!");
    },
  },
};

export const LoadingThenShowingSchedule: Story = {
  args: {
    open: true,
    loading: true,
    close: identity,
    tutorId: faker.number.int(),
    name: faker.person.fullName(),
    imageUrl: faker.image.urlPicsumPhotos({ width: 400, height: 400 }),
    slots: makeSlots(5),
    bookedSlots: [],
    onSubmit() {
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
    return <ManageLessonDialog {...props} loading={loading} />;
  },
};

export const EmptySchedule: Story = {
  args: {
    open: true,
    close: identity,
    tutorId: faker.number.int(),
    name: faker.person.fullName(),
    imageUrl: faker.image.urlPicsumPhotos({ width: 400, height: 400 }),
    slots: [],
    bookedSlots: [],
    onSubmit() {
      alert("Lesson booked!!");
    },
  },
};

export const ErrorSchedule: Story = {
  args: {
    open: true,
    close: identity,
    tutorId: faker.number.int(),
    name: faker.person.fullName(),
    imageUrl: faker.image.urlPicsumPhotos({ width: 400, height: 400 }),
    slots: [],
    bookedSlots: [],
    onSubmit() {
      alert("Lesson booked!!");
    },
    error: true,
  },
};

export default meta;
