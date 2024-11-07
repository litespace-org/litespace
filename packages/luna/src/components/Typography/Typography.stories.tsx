import type { Meta, StoryObj } from "@storybook/react";
import { Typography } from "@/components/Typography";
import React from "react";
import ar from "@/locales/ar-eg.json";

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
        <Typography element="h1">{ar["notice.desc.1"]}</Typography>
        <Typography element="h1" weight="bold">
          {ar["notice.desc.1"]}
        </Typography>
        <Typography element="h1" weight="semibold">
          {ar["notice.desc.1"]}
        </Typography>
        <Typography element="h1" weight="medium">
          {ar["notice.desc.1"]}
        </Typography>
        <Typography element="h2">{ar["notice.desc.1"]}</Typography>
        <Typography element="h2">{ar["notice.desc.1"]}</Typography>
        <Typography element="h3">{ar["notice.desc.1"]}</Typography>
        <Typography element="h4">{ar["notice.desc.1"]}</Typography>
        <Typography element="subtitle-1">{ar["notice.desc.1"]}</Typography>
        <Typography element="subtitle-2">{ar["notice.desc.1"]}</Typography>
        <Typography element="body">{ar["notice.desc.1"]}</Typography>
        <Typography element="caption">{ar["notice.desc.1"]}</Typography>
        <br />
        <Typography element="tiny-text">{ar["notice.desc.1"]}</Typography>
      </div>
    );
  },
};

export default meta;
