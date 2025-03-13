import type { Preview } from "@storybook/react";
// eslint-disable-next-line no-restricted-imports
import Decorator from "./decorator.tsx";
import "@/index.css";

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
