import { StoryObj, Meta } from "@storybook/react";
import { Selector } from "@/components/PlansV2";
import { faker } from "@faker-js/faker/locale/ar";
import { range } from "lodash";

const meta: Meta<typeof Selector> = {
  title: "PlansSelector",
  component: Selector,
  decorators: [
    (Story) => (
      <div>
        <Story />
      </div>
    ),
  ],
};

type Story = StoryObj<typeof Selector>;

function makePlan(max: number) {
  return {
    id: faker.number.int(),
    weeklyMinutes: faker.number.int({ min: 30, max: 350 }),
    baseMonthlyPrice: faker.number.float({
      min: 500,
      max: 1500,
      fractionDigits: 2,
    }),
    monthDiscount: faker.number.float({ min: 0, max, fractionDigits: 0 }),
    quarterDiscount: faker.number.float({ min: 0, max, fractionDigits: 0 }),
    yearDiscount: faker.number.float({ min: 0, max, fractionDigits: 0 }),
  };
}

export const Primary: Story = {
  args: {
    plans: range(3).map(() => makePlan(10)),
    onSelect: ({ planId, duration }) => console.log({ planId, duration }),
  },
};

export const WithoutDiscount: Story = {
  args: {
    plans: range(3).map(() => makePlan(0)),
    onSelect: ({ planId, duration }) => console.log({ planId, duration }),
  },
};

export default meta;
