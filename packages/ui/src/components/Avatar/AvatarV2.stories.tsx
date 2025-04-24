import type { Meta, StoryObj } from "@storybook/react";
import { AvatarV2 } from "@/components/Avatar/AvatarV2";
import React from "react";
import { range } from "lodash";
import { Tooltip } from "@/components/Tooltip";
import { Typography } from "@/components/Typography";
import { faker } from "@faker-js/faker/locale/ar";

type Component = typeof AvatarV2;
type Story = StoryObj<Component>;

const meta: Meta<Component> = {
  title: "AvatarV2",
  component: AvatarV2,
  argTypes: {
    src: { control: "text" },
    alt: { control: "text" },
  },
  parameters: {
    layout: "centered",
  },
};

export const Primary: Story = {
  args: {
    src: faker.image.urlPicsumPhotos({ width: 400, height: 400 }),
    alt: "image",
    id: Math.random() * 200,
  },
  render(props) {
    return (
      <div className="w-40 h-40 rounded-full overflow-hidden">
        <AvatarV2 {...props} />
      </div>
    );
  },
};

export const All: Story = {
  args: {},
  render() {
    return (
      <div className="grid grid-cols-4">
        {range(0, 20).map((i) => (
          <div className="grid-cols-1 w-40 h-40" key={i}>
            <Tooltip
              side="top"
              content={<Typography tag="p">Index: {i}</Typography>}
            >
              <div className="w-full h-full">
                <AvatarV2 id={i} />
              </div>
            </Tooltip>
          </div>
        ))}
      </div>
    );
  },
};

export const Rounded: Story = {
  args: {},
  render() {
    return (
      <div className="grid grid-cols-4 gap-4">
        {range(0, 20).map((i) => (
          <div className="grid-cols-1 w-40 h-40" key={i}>
            <Tooltip
              side="top"
              content={<Typography tag="p">Index: {i}</Typography>}
            >
              <div className="w-full h-full rounded-full overflow-hidden">
                <AvatarV2 id={i} />
              </div>
            </Tooltip>
          </div>
        ))}
      </div>
    );
  },
};

export default meta;
