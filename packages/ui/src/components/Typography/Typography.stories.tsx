import type { Meta, StoryObj } from "@storybook/react";
import { Typography } from "@/components/Typography";
import React from "react";
import { faker } from "@faker-js/faker/locale/ar";

type Component = typeof Typography;

const meta: Meta<Component> = {
  title: "Typography",
  component: Typography,
  parameters: {
    layout: "centered",
  },
};

export const Primary: StoryObj<Component> = {
  args: {},
  render() {
    return (
      <div>
        <Typography tag="h1" className="text-h1">
          {faker.lorem.words()}
        </Typography>
        <Typography tag="h2" className="text-h2 font-bold">
          {faker.lorem.words()}
        </Typography>
        <Typography tag="h1" className="text-h1 font-semibold">
          {faker.lorem.words()}
        </Typography>
        <Typography tag="h1" className="text-h1 font-medium">
          {faker.lorem.words()}
        </Typography>
        <Typography tag="h2" className="text-h-2">
          {faker.lorem.words()}
        </Typography>
        <Typography tag="h3" className="text-h3">
          {faker.lorem.words()}
        </Typography>
        <Typography tag="h4" className="text-h4">
          {faker.lorem.words()}
        </Typography>
        <Typography tag="p" className="text-subtitle-1">
          {faker.lorem.words()}
        </Typography>
        <Typography tag="p" className="text-subtitle-2">
          {faker.lorem.words()}
        </Typography>
        <Typography tag="p" className="text-body">
          {faker.lorem.words()}
        </Typography>
        <Typography tag="p" className="text-caption">
          {faker.lorem.words()}
        </Typography>
        <Typography tag="span" className="text-tiny">
          {faker.lorem.words()}
        </Typography>
      </div>
    );
  },
};

export default meta;
