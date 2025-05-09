import type { Preview } from "@storybook/react";
import Decorator from "./decorator.tsx";
import "@litespace/ui/tailwind.css";

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
