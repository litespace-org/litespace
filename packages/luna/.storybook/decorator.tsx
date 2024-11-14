import React from "react";
import { Button } from "../src/components/Button";
import { useTheme } from "../src/hooks/theme";
import { IntlProvider } from "react-intl";
import { ToastProvider } from "../src/components/Toast";
import { locales } from "../src/locales";

const Decorator = (Story: React.FC) => {
  const { toggle } = useTheme();
  return (
    <IntlProvider
      messages={locales["ar-EG"]}
      locale="ar-EG"
      defaultLocale="ar-EG"
    >
      <ToastProvider>
        <div>
          <div className="tw-mb-4">
            <Button onClick={toggle}>Toggle Theme</Button>
          </div>
          <Story />
        </div>
      </ToastProvider>
    </IntlProvider>
  );
};

export default Decorator;
