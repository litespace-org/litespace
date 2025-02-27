import React from "react";
import { Button } from "@/components/Button";
import { useFormatMessage } from "@/hooks";

const ErrorPage: React.FC = () => {
  const intl = useFormatMessage();
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
          <h1 className="text-subtitle-1">{intl("page.error.title")}</h1>
          <p className="text-subtitle-2 text-foreground-light">
            {intl("page.error.subtitle")}
          </p>
        </div>
        <div className="mt-4">
          <Button size={"medium"}>{intl("page.error.button.label")}</Button>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
