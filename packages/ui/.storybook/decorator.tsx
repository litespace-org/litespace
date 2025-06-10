import React from "react";
import { Button } from "../src/components/Button";
import { useTheme } from "../src/hooks/theme";
import { IntlProvider } from "react-intl";
import { ToastProvider } from "../src/components/Toast";
import { locales } from "../src/locales";
import { Direction } from "../src/components/Direction";
import { MediaQueryProvider } from "@litespace/headless/mediaQuery";
import { LoggerProvider, WebLogger } from "@litespace/headless/logger";
import { MemoryRouter } from "react-router-dom";

const logger = new WebLogger();

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
            <MemoryRouter initialEntries={["/"]}>
              <LoggerProvider logger={logger}>
                <div className="bg-natural-50 p-6 rounded-md">
                  <div className="mb-4">
                    <Button
                      onClick={toggle}
                      size="small"
                      type="natural"
                      variant="secondary"
                    >
                      Toggle Theme
                    </Button>
                  </div>
                  <Story />
                </div>
              </LoggerProvider>
            </MemoryRouter>
          </MediaQueryProvider>
        </ToastProvider>
      </Direction>
    </IntlProvider>
  );
};

export default Decorator;
