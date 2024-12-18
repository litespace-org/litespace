import { Meta, StoryObj } from "@storybook/react";
import { RateLesson } from "@/components/Lessons/RateLesson/RateLesson";
import { faker } from "@faker-js/faker/locale/ar";

const meta: Meta<typeof RateLesson> = {
  title: "Lessons/RateLesson",
  component: RateLesson,
};

export default meta;

type Story = StoryObj<typeof RateLesson>;

export const SessionRating: Story = {
  args: {
    rateLoading: false,
    tutorName: faker.person.fullName(),
    close: () => alert("closing dialog"),
    onRate: ({ value, feedback }: { value: number; feedback: string | null }) =>
      alert(`${5} ${value} ${feedback}`),
  },
};

export const PlatformRating: Story = {
  args: {
    rateLoading: false,
    type: "platform",
    tutorName: faker.person.fullName(),
    close: () => alert("closing dialog"),
    onRate: ({ value, feedback }: { value: number; feedback: string | null }) =>
      alert(`${5} ${value} ${feedback}`),
  },
};

export const Loading: Story = {
  args: {
    rateLoading: true,
    tutorName: faker.person.fullName(),
    close: () => alert("closing dialog"),
    onRate: () => alert("rated the lesson"),
  },
};
