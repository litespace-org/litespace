import type { Preview } from "@storybook/react";
// eslint-disable-next-line
import Decorator from "./decorator";
import "@/index.css";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    layout: "centered",
  },
  decorators: [Decorator],
};

export default preview;
