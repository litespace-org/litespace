import type { Preview } from "@storybook/react";
import Decorator from "./decorator";
import "../src/style.css";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  decorators: [Decorator],
};

export default preview;
