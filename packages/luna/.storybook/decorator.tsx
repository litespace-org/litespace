import React from "react";
import { Button, ButtonSize } from "../src/components/Button";
import { useTheme } from "../src/hooks/theme";
import { IntlProvider } from "react-intl";
import { ToastProvider } from "../src/components/Toast";
import { locales } from "../src/locales";
import { Direction } from "../src/components/Direction";
import { MemoryRouter } from "react-router-dom";

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
              <Button onClick={toggle} size={ButtonSize.Tiny}>
                Toggle Theme
              </Button>
            </div>
            <MemoryRouter initialEntries={["/"]}>
              <Story />
            </MemoryRouter>
          </div>
        </ToastProvider>
      </Direction>
    </IntlProvider>
  );
};

export default Decorator;
