import React from "react";
import { Button } from "../src/components/Button";
import { useTheme } from "../src/hooks/theme";
import { IntlProvider } from "react-intl";
import { ToastProvider } from "../src/components/Toast";
import { locales } from "../src/locales";
import { Direction } from "../src/components/Direction";

const Decorator = (Story: React.FC) => {
  const { toggle } = useTheme();
  return (
    <IntlProvider
      messages={locales["ar-EG"]}
      locale="ar-EG"
      defaultLocale="ar-EG"
    >
      <Direction>
        <ToastProvider>
          <div dir="rtl" className="tw-font-cairo">
            <div className="tw-mb-4">
              <Button onClick={toggle}>Toggle Theme</Button>
            </div>
            <Story />
          </div>
        </ToastProvider>
      </Direction>
    </IntlProvider>
  );
};

export default Decorator;
