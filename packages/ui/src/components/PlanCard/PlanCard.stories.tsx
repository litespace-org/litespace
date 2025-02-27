import React from "react";
import { Meta, StoryObj } from "@storybook/react";
import { PlanCard } from "@/components/PlanCard";
import { faker } from "@faker-js/faker/locale/ar";

type Story = StoryObj<typeof PlanCard>;

const meta: Meta<typeof PlanCard> = {
  title: "PlanCard",
  component: PlanCard,
  decorators: [
    (Story) => (
      <div className="w-[368px] mt-20">
        <Story />
      </div>
    ),
  ],
};
export const PrimaryWithoutLabel: Story = {
  args: {
    title: faker.lorem.words(1),
    description: faker.lorem.words(15),
    price: faker.number.int({ min: 1, max: 1000 }),
    onBuy: () => alert("buy"),
    primary: true,
    weeklyMinutes: faker.number.int({ min: 30, max: 200 }),
  },
};

export const PrimaryWithCommonLabel: Story = {
  args: {
    title: faker.lorem.words(1),
    description: faker.lorem.words(15),
    price: faker.number.int({ min: 1, max: 1000 }),
    label: "most-common",
    onBuy: () => alert("buy"),
    primary: true,
    weeklyMinutes: faker.number.int({ min: 30, max: 200 }),
  },
};

export const PrimaryWithValuableLabel: Story = {
  args: {
    title: faker.lorem.words(1),
    description: faker.lorem.words(15),
    price: faker.number.int({ min: 1, max: 1000 }),
    label: "most-valuable",
    onBuy: () => alert("buy"),
    primary: true,
    weeklyMinutes: faker.number.int({ min: 30, max: 200 }),
  },
};

export const SecondaryWithoutLabel: Story = {
  args: {
    title: faker.lorem.words(1),
    description: faker.lorem.words(15),
    price: faker.number.int({ min: 1, max: 1000 }),
    onBuy: () => alert("buy"),
    primary: false,
    weeklyMinutes: faker.number.int({ min: 30, max: 200 }),
  },
};

export const SecondaryWithCommonLabel: Story = {
  args: {
    title: faker.lorem.words(1),
    description: faker.lorem.words(15),
    price: faker.number.int({ min: 1, max: 1000 }),
    label: "most-common",
    onBuy: () => alert("buy"),
    primary: false,
    weeklyMinutes: faker.number.int({ min: 30, max: 200 }),
  },
};

export const SecondaryWithValuableLabel: Story = {
  args: {
    title: faker.lorem.words(1),
    description: faker.lorem.words(15),
    price: faker.number.int({ min: 1, max: 1000 }),
    label: "most-valuable",
    onBuy: () => alert("buy"),
    primary: false,
    weeklyMinutes: faker.number.int({ min: 30, max: 200 }),
  },
};

export const SecondaryWithValuableLabelMobile: Story = {
  args: {
    title: faker.lorem.words(1),
    description: faker.lorem.words(15),
    price: faker.number.int({ min: 1, max: 1000 }),
    label: "most-valuable",
    primary: false,
    weeklyMinutes: faker.number.int({ min: 30, max: 200 }),
    onBuy: () => alert("buy"),
  },
};

export const PrimaryWithDiscount: Story = {
  args: {
    title: faker.lorem.words(1),
    description: faker.lorem.words(15),
    price: faker.number.int({ min: 1, max: 1000 }),
    label: "most-valuable",
    discount: faker.number.int({ min: 0, max: 100 }),
    onBuy: () => alert("buy"),
    primary: true,
    weeklyMinutes: faker.number.int({ min: 30, max: 200 }),
  },
};

export const SecondaryWithDiscount: Story = {
  args: {
    title: faker.lorem.words(1),
    description: faker.lorem.words(15),
    price: faker.number.int({ min: 1, max: 1000 }),
    label: "most-valuable",
    discount: faker.number.int({ min: 0, max: 100 }),
    onBuy: () => alert("buy"),
    primary: false,
    weeklyMinutes: faker.number.int({ min: 30, max: 200 }),
  },
};

export const HighStatsWithoutDiscount: Story = {
  args: {
    title: faker.lorem.words(1),
    description: faker.lorem.words(15),
    price: faker.number.int({ min: 5_000, max: 10_000 }),
    label: "most-valuable",
    onBuy: () => alert("buy"),
    primary: false,
    weeklyMinutes: faker.number.int({ min: 10_000, max: 10_080 }),
  },
};

export const HighStatsWithDiscount: Story = {
  args: {
    title: faker.lorem.words(1),
    description: faker.lorem.words(15),
    price: faker.number.int({ min: 5_000, max: 10_000 }),
    label: "most-valuable",
    discount: faker.number.int({ min: 90, max: 100 }),
    onBuy: () => alert("buy"),
    primary: false,
    weeklyMinutes: faker.number.int({ min: 10_000, max: 10_080 }),
  },
};

export default meta;
