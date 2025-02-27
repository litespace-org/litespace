import type { Meta, StoryObj } from "@storybook/react";
import { Timeline } from "@/components/Timeline";
import { DarkStoryWrapper } from "@/internal/DarkWrapper";
import { Cpu, HardDrive, Mic, User } from "react-feather";
import { Button } from "@/components/Button";

type Component = typeof Timeline;

const meta: Meta<Component> = {
  title: "Timeline",
  component: Timeline,
  parameters: { layout: "centered" },
  decorators: [DarkStoryWrapper],
};

export const Primary: StoryObj<Component> = {
  args: {
    timeline: [
      {
        id: 1,
        children: (
          <div>
            <h1 className="mb-4">Hello</h1>
            <Button className="min-w-[200px]">Start</Button>
          </div>
        ),
        icon: <Mic />,
      },
      { id: 1, children: <h1>Second</h1>, icon: <User /> },
      { id: 1, children: <h1>Third</h1>, icon: <Cpu /> },
      { id: 1, children: <h1>Forth</h1>, icon: <HardDrive /> },
    ],
  },
};

export default meta;
