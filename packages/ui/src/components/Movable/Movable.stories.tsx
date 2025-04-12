import React, { useRef } from "react";
import type { Meta } from "@storybook/react";
import { Movable } from "@/components/Movable";

type Component = typeof Movable;

const meta: Meta<Component> = {
  title: "Movable",
  component: Movable,
  parameters: { layout: "centered" },
  decorators: [],
};

export const Primary = {
  render: () => {
    const ref = useRef<HTMLDivElement>(null);
    return (
      <div className="w-[1000px]">
        <div ref={ref} className="border border-black w-1/2 h-[500px]">
          <Movable container={ref}>Hello I am Movable</Movable>
        </div>
      </div>
    );
  },
};
export default meta;
