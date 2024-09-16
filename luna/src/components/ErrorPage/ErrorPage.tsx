import React from "react";
import { useIntl } from "react-intl";
import { Button, ButtonSize } from "@/components/Button";
import { messages } from "@/locales";

const ErrorPage: React.FC = () => {
  const intl = useIntl();
  return (
    <div
      className="bg-dash-sidebar text-foreground min-h-screen flex items-center justify-center relative font-cairo"
      id="error-page"
    >
      <div className="select-none opacity-[5%] filter transition duration-200 blur-sm">
        <h1 className="text-[28rem]">404</h1>
      </div>

      <div className="flex flex-col items-center justify-center absolute">
        <div className="flex flex-col items-center justify-center space-y-3">
          <h1 className="text-2xl">
            {intl.formatMessage({ id: messages["page.error.title"] })}
          </h1>
          <p className="text-xl text-foreground-light">
            {intl.formatMessage({ id: messages["page.error.subtitle"] })}
          </p>
        </div>
        <div className="mt-4">
          <Button size={ButtonSize.Small}>
            {intl.formatMessage({ id: messages["page.error.button.label"] })}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
