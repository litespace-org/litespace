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
        <Typography tag="h1" className="tw-text-h1">
          {faker.lorem.words()}
        </Typography>
        <Typography tag="h2" className="tw-text-h2 tw-font-bold">
          {faker.lorem.words()}
        </Typography>
        <Typography tag="h1" className="tw-text-h1 tw-font-semibold">
          {faker.lorem.words()}
        </Typography>
        <Typography tag="h1" className="tw-text-h1 tw-font-medium">
          {faker.lorem.words()}
        </Typography>
        <Typography tag="h2" className="tw-text-h-2">
          {faker.lorem.words()}
        </Typography>
        <Typography tag="h3" className="tw-text-h3">
          {faker.lorem.words()}
        </Typography>
        <Typography tag="h4" className="tw-text-h4">
          {faker.lorem.words()}
        </Typography>
        <Typography tag="p" className="tw-text-subtitle-1">
          {faker.lorem.words()}
        </Typography>
        <Typography tag="p" className="tw-text-subtitle-2">
          {faker.lorem.words()}
        </Typography>
        <Typography tag="p" className="tw-text-body">
          {faker.lorem.words()}
        </Typography>
        <Typography tag="p" className="tw-text-caption">
          {faker.lorem.words()}
        </Typography>
        <Typography tag="span" className="tw-text-tiny">
          {faker.lorem.words()}
        </Typography>
      </div>
    );
  },
};

export default meta;
