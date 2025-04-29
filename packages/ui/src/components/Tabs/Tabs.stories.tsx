import { StoryObj, Meta } from "@storybook/react";
import React from "react";
import { Tabs } from "@/components/Tabs";
import { faker } from "@faker-js/faker/locale/ar";
import { random, range, sample } from "lodash";

const meta: Meta<typeof Tabs> = {
  title: "Tabs",
  component: Tabs,
  decorators: [
    (Story) => (
      <div>
        <Story />
      </div>
    ),
  ],
};

type Story = StoryObj<typeof Tabs>;

function makeTabs(num: number) {
  return range(num).map((_, idx) => ({
    id: idx.toString(),
    label: faker.lorem.words(2),
    important: [true, false][random(0, 1)],
    view: sample([<h1>{faker.lorem.words(20)}</h1>, null]),
  }));
}

export const Primary: Story = {
  args: {
    tabs: makeTabs(4),
    onChange: (tab) => console.log(tab),
  },
};

export const WithActiveTab: Story = {
  args: {
    tab: "2",
    tabs: makeTabs(4),
    onChange: (tab) => console.log(tab),
  },
};

export const WithTabViewStule: Story = {
  args: {
    tab: "2",
    tabs: makeTabs(4),
    onChange: (tab) => console.log(tab),
    viewContainerClassName: "flex justify-center items-center m-4 rounded-xl",
  },
};

export default meta;
