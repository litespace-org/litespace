import React from "react";
import { Button } from "../src/components/Button";
import { useTheme } from "../src/hooks/theme";

const Decorator = (Story: React.FC) => {
  const { toggle } = useTheme();
  return (
    <div>
      <div className="tw-mb-4">
        <Button onClick={toggle}>Toggle Theme</Button>
      </div>
      <Story />
    </div>
  );
};

export default Decorator;
