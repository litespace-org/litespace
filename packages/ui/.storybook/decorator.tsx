import React from "react";
import { Button } from "../src/components/Button";
import { useTheme } from "../src/hooks/theme";
import { IntlProvider } from "react-intl";
import { ToastProvider } from "../src/components/Toast";
import { locales } from "../src/locales";
import { Direction } from "../src/components/Direction";
import { MediaQueryProvider } from "@litespace/headless/mediaQuery";
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
          <MediaQueryProvider>
            <div dir="rtl" className="font-cairo">
              <div className="mb-4">
                <Button onClick={toggle} size={"small"}>
                  Toggle Theme
                </Button>
              </div>
              <MemoryRouter initialEntries={["/"]}>
                <Story />
              </MemoryRouter>
            </div>
          </MediaQueryProvider>
        </ToastProvider>
      </Direction>
    </IntlProvider>
  );
};

export default Decorator;
