import type { Meta, StoryObj } from "@storybook/react";
import { Title } from "@/components/Title";

type Component = typeof Title;

const meta: Meta<Component> = {
  title: "Title",
  component: Title,
  parameters: {
    layout: "centered",
  },
};

export const Primary: StoryObj<Component> = {
  args: {},
  render() {
    return (
      <div>
        <Title level={1}>السلام عليكم ورحمة الله وبركاته</Title>
        <Title level={2}>السلام عليكم ورحمة الله وبركاته</Title>
        <Title level={3}>السلام عليكم ورحمة الله وبركاته</Title>
        <Title level={4}>السلام عليكم ورحمة الله وبركاته</Title>
        <Title level={5}>السلام عليكم ورحمة الله وبركاته</Title>
        <Title level={6}>السلام عليكم ورحمة الله وبركاته</Title>
      </div>
    );
  },
};

export default meta;
