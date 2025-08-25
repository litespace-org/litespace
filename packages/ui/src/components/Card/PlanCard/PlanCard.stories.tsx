import { PlanCard } from "@/components/Card/PlanCard/PlanCard";
import { faker } from "@faker-js/faker/locale/ar";
import type { Meta, StoryObj } from "@storybook/react";
const meta: Meta<typeof PlanCard> = {
  title: "Components/PlanCard",
  component: PlanCard,
  tags: ["autodocs"],
  argTypes: {
    onSelect: { action: "clicked" },
  },
};

export default meta;
type Story = StoryObj<typeof PlanCard>;

export const Default: Story = {
  args: {
    title: faker.lorem.words(5),
    discount: 15,
    description: faker.lorem.words(15),
    monthlyPrice: 3500,
    weeklyMinutes: 120,
    features: [faker.lorem.words(18), faker.lorem.words(17)],
  },
};

export const WithoutDiscount: Story = {
  args: {
    title: faker.lorem.words(5),
    features: [faker.lorem.words(5)],
    discount: 20,
    description: faker.lorem.words(15),
    monthlyPrice: faker.number.int(100),
    weeklyMinutes: 180,
  },
};

export const Yearly: Story = {
  args: {
    title: faker.lorem.words(5),
    discount: 35,
    description: faker.lorem.words(15),
    monthlyPrice: faker.number.int(300),
    weeklyMinutes: 240,
    features: [faker.lorem.words(5), faker.lorem.words(5)],
  },
};

export const MostCommon: Story = {
  args: {
    title: faker.lorem.words(5),
    discount: 35,
    description: faker.lorem.words(15),
    monthlyPrice: faker.number.int(300),
    weeklyMinutes: 240,
    features: [faker.lorem.words(5), faker.lorem.words(5)],
    mostCommon: true,
  },
};
