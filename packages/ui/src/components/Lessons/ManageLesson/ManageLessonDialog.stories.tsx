import { StoryObj, Meta } from "@storybook/react";
import { ManageLessonDialog } from "@/components/Lessons/ManageLesson";
import React, { useEffect, useState } from "react";
import { identity, range, sample } from "lodash";
import { faker } from "@faker-js/faker/locale/ar";
import dayjs from "@/lib/dayjs";
import { IAvailabilitySlot } from "@litespace/types";

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
      purpose: sample([
        IAvailabilitySlot.Purpose.Lesson,
        IAvailabilitySlot.Purpose.Interview,
      ])!,
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
    isVerified: true,
    hasBookedLessons: false,
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
    isVerified: true,
    hasBookedLessons: false,
    slots: [
      {
        id: 1,
        start: dayjs.utc().startOf("day").toISOString(),
        end: dayjs.utc().startOf("day").add(4, "hours").toISOString(),
        purpose: IAvailabilitySlot.Purpose.Lesson,
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

export const FilterPastSlots: Story = {
  args: {
    open: true,
    close: identity,
    tutorId: faker.number.int(),
    name: faker.person.fullName(),
    imageUrl: faker.image.urlPicsumPhotos({ width: 400, height: 400 }),
    isVerified: true,
    hasBookedLessons: false,
    slots: [
      {
        id: 1,
        start: dayjs.utc().subtract(1, "hour").startOf("hour").toISOString(),
        end: dayjs.utc().add(4, "hours").add(4, "hours").toISOString(),
        createdAt: faker.date.past().toISOString(),
        updatedAt: faker.date.past().toISOString(),
        deleted: false,
        userId: 4,
        purpose: sample([
          IAvailabilitySlot.Purpose.Lesson,
          IAvailabilitySlot.Purpose.Interview,
        ]),
      },
    ],
    bookedSlots: [],
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
    isVerified: true,
    hasBookedLessons: false,
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
    isVerified: true,
    hasBookedLessons: false,
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
    isVerified: true,
    hasBookedLessons: false,
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
    isVerified: true,
    hasBookedLessons: false,
    onSubmit() {
      alert("Lesson booked!!");
    },
  },
};

export const Unverified: Story = {
  args: {
    open: true,
    close: identity,
    tutorId: faker.number.int(),
    name: faker.person.fullName(),
    imageUrl: faker.image.urlPicsumPhotos({ width: 400, height: 400 }),
    slots: [],
    isVerified: false,
    hasBookedLessons: false,
    bookedSlots: [],
    sendVerifyEmail() {
      alert("Send verify email");
    },
  },
};

export const HasBookedLessons: Story = {
  args: {
    open: true,
    close: identity,
    tutorId: faker.number.int(),
    name: faker.person.fullName(),
    imageUrl: faker.image.urlPicsumPhotos({ width: 400, height: 400 }),
    slots: [],
    isVerified: true,
    hasBookedLessons: true,
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

export const LoadingThenBlocked: Story = {
  args: {
    open: true,
    loading: true,
    close: identity,
    tutorId: faker.number.int(),
    name: faker.person.fullName(),
    imageUrl: faker.image.urlPicsumPhotos({ width: 400, height: 400 }),
    slots: makeSlots(5),
    isVerified: true,
    hasBookedLessons: true,
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

export default meta;
