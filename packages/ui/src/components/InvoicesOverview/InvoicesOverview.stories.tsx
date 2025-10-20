import { StoryObj, Meta } from "@storybook/react";
import React from "react";
import { InvoicesOverview } from "@/components/InvoicesOverview";
import { faker } from "@faker-js/faker/locale/ar";

const meta: Meta<typeof InvoicesOverview> = {
  title: "InvoicesOverview",
  component: InvoicesOverview,
  parameters: {
    layout: "center",
  },
  decorators: [
    (Story) => (
      <div className="p-6">
        <Story />
      </div>
    ),
  ],
};

type Story = StoryObj<typeof InvoicesOverview>;

export const Primary: Story = {
  args: {
    fulfilledRevenue: faker.number.int({ min: 100, max: 10_000 }),
    availableRevenue: faker.number.int({ min: 100, max: 10_000 }),
    pendingRevenue: faker.number.int({ min: 0, max: 10 }),
    futureRevenue: faker.number.int({ min: 100, max: 10_000 }),
    loading: false,
    error: false,
    retry: () => alert("retry"),
  },
};

export const LargeNumbers: Story = {
  args: {
    fulfilledRevenue: faker.number.int({ min: 100_000, max: 1_000_000 }),
    availableRevenue: faker.number.int({ min: 100_000, max: 1_000_000 }),
    pendingRevenue: faker.number.int({ min: 0, max: 10 }),
    futureRevenue: faker.number.int({ min: 100_000, max: 1_000_000 }),
    loading: false,
    error: false,
    retry: () => alert("retry"),
  },
};

export const Loading: Story = {
  args: {
    fulfilledRevenue: faker.number.int({ min: 100_000, max: 1_000_000 }),
    availableRevenue: faker.number.int({ min: 100_000, max: 1_000_000 }),
    pendingRevenue: faker.number.int({ min: 0, max: 10 }),
    futureRevenue: faker.number.int({ min: 100_000, max: 1_000_000 }),
    loading: true,
    error: false,
    retry: () => alert("retry"),
  },
};

export const Error: Story = {
  args: {
    fulfilledRevenue: faker.number.int({ min: 100_000, max: 1_000_000 }),
    availableRevenue: faker.number.int({ min: 100_000, max: 1_000_000 }),
    pendingRevenue: faker.number.int({ min: 0, max: 10 }),
    futureRevenue: faker.number.int({ min: 100_000, max: 1_000_000 }),
    loading: false,
    error: true,
    retry: () => alert("retry"),
  },
};

export default meta;
