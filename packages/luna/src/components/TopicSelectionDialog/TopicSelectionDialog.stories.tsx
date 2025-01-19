import React, { useEffect, useState } from "react";
import { faker } from "@faker-js/faker/locale/ar";
import { Meta, StoryObj } from "@storybook/react";
import { TopicSelectionDialog } from "@/components/TopicSelectionDialog";

type Story = StoryObj<typeof TopicSelectionDialog>;

const meta: Meta<typeof TopicSelectionDialog> = {
  title: "TopicSelectionDialog",
  component: TopicSelectionDialog,
  decorators: [
    (Story) => (
      <div>
        <Story />
      </div>
    ),
  ],
};

const actions = {
  close: () => alert("close..."),
  confirm: (topicIds: number[]) => alert(topicIds),
};

export const FewTopics: Story = {
  args: {
    topics: faker.lorem
      .words(10)
      .split(" ")
      .map((word, i) => ({ id: i, label: word })),
    opened: true,
    ...actions,
  },
};

export const ManyTopics: Story = {
  args: {
    topics: faker.lorem
      .words(50)
      .split(" ")
      .map((word, i) => ({ id: i, label: word })),
    opened: true,
    ...actions,
  },
};

export const WithSelectedTopics: Story = {
  args: {
    topics: faker.lorem
      .words(10)
      .split(" ")
      .map((word, i) => ({ id: i, label: word })),
    opened: true,
    selectedTopicIds: [1, 5],
    ...actions,
  },
};

export const Error: Story = {
  args: {
    topics: [],
    opened: true,
    error: true,
    ...actions,
  },
};

export const Loading: Story = {
  args: {
    topics: [],
    opened: true,
    loading: true,
    ...actions,
  },
};

export const Confirming: Story = {
  args: {
    topics: faker.lorem
      .words(10)
      .split(" ")
      .map((word, i) => ({ id: i, label: word })),
    selectedTopicIds: [1, 4, 8],
    opened: true,
    confirming: true,
    ...actions,
  },
};

export const Simulation: Story = {
  args: {
    topics: faker.lorem
      .words(100)
      .split(" ")
      .map((word, i) => ({ id: i, label: word })),
    selectedTopicIds: [1, 4, 8],
    opened: true,
    ...actions,
  },
  render(props) {
    const [loading, setLoading] = useState<boolean>(true);
    useEffect(() => {
      const id = setTimeout(() => {
        setLoading(false);
      }, 1_500);
      return () => {
        clearTimeout(id);
      };
    });
    return <TopicSelectionDialog {...props} loading={loading} />;
  },
};

export default meta;
