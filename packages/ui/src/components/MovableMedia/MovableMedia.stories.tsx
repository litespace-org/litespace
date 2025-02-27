import React, { useRef } from "react";
import type { Meta } from "@storybook/react";
import { MovableMedia } from "@/components/MovableMedia";

type Component = typeof MovableMedia;

const meta: Meta<Component> = {
  title: "MovableMedia",
  component: MovableMedia,
  parameters: { layout: "centered" },
  decorators: [],
};

export const Primary = {
  render: () => {
    const ref = useRef<HTMLDivElement>(null);
    return (
      <div className="w-[1000px]">
        <div ref={ref} className="border border-black w-1/2 h-[500px]">
          <MovableMedia container={ref}>Hello I am Movable</MovableMedia>
        </div>
      </div>
    );
  },
};
export default meta;
