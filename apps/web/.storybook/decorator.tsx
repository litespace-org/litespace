import React from "react";
import { IntlProvider } from "react-intl";
import { MediaQueryProvider } from "@litespace/headless/mediaQuery";
import { MemoryRouter } from "react-router-dom";
import { ToastProvider } from "@litespace/ui/Toast";
import { locales } from "@litespace/ui/locales";

const Decorator = (Story: React.FC) => {
  return (
    <IntlProvider
      messages={locales["ar-EG"]}
      locale="ar-EG"
      defaultLocale="ar-EG"
    >
      <ToastProvider>
        <MediaQueryProvider>
          <div dir="rtl" className="font-cairo bg-natural-50">
            <MemoryRouter initialEntries={["/"]}>
              <Story />
            </MemoryRouter>
          </div>
        </MediaQueryProvider>
      </ToastProvider>
    </IntlProvider>
  );
};
export default Decorator;
