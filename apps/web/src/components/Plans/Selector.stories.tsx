import { StoryObj, Meta } from "@storybook/react";
import { Selector } from "@/components/Plans/Selector";
import { faker } from "@faker-js/faker/locale/ar";
import { range } from "lodash";
import { percentage, price } from "@litespace/utils";
import { IPlan } from "@litespace/types";

const meta: Meta<typeof Selector> = {
  title: "PlansSelector",
  component: Selector,
  decorators: [
    (Story) => (
      <div className="p-6 h-screen flex items-center">
        <div className="w-full">
          <Story />
        </div>
      </div>
    ),
  ],
};

type Story = StoryObj<typeof Selector>;

function makePlan(max: number): IPlan.Self {
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
    active: false,
    forInvitesOnly: false,
    createdAt: faker.date.past().toISOString(),
    updatedAt: faker.date.past().toISOString(),
  };
}

export const Primary: Story = {
  args: {
    plans: [
      {
        id: 3,
        weeklyMinutes: 180,
        baseMonthlyPrice: price.scale(3800),
        monthDiscount: percentage.scale(15),
        quarterDiscount: percentage.scale(20),
        yearDiscount: percentage.scale(25),
        active: false,
        forInvitesOnly: false,
        createdAt: faker.date.past().toISOString(),
        updatedAt: faker.date.past().toISOString(),
      },
      {
        id: 2,
        weeklyMinutes: 150,
        baseMonthlyPrice: price.scale(3500),
        monthDiscount: percentage.scale(10),
        quarterDiscount: percentage.scale(15),
        yearDiscount: percentage.scale(20),
        active: false,
        forInvitesOnly: false,
        createdAt: faker.date.past().toISOString(),
        updatedAt: faker.date.past().toISOString(),
      },
      {
        id: 1,
        weeklyMinutes: 120,
        baseMonthlyPrice: price.scale(2500),
        monthDiscount: percentage.scale(0),
        quarterDiscount: percentage.scale(10),
        yearDiscount: percentage.scale(20),
        active: false,
        forInvitesOnly: false,
        createdAt: faker.date.past().toISOString(),
        updatedAt: faker.date.past().toISOString(),
      },
    ],
  },
};

export const WithoutDiscount: Story = {
  args: {
    plans: range(3).map(() => makePlan(0)),
  },
};

export default meta;
