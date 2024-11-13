import React from "react";
import { Button } from "../src/components/Button";
import { useTheme } from "../src/hooks/theme";
import { IntlProvider } from "react-intl";
import { locales } from "../src/locales";

const Decorator = (Story: React.FC) => {
  const { toggle } = useTheme();
  return (
    <IntlProvider
      messages={locales["ar-EG"]}
      locale="ar-EG"
      defaultLocale="ar-EG"
    >
      <div>
        <div className="tw-mb-4">
          <Button onClick={toggle}>Toggle Theme</Button>
        </div>
        <Story />
      </div>
    </IntlProvider>
  );
};

export default Decorator;
