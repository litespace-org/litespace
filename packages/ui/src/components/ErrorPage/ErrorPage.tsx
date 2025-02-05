import React from "react";
import { Button } from "@/components/Button";
import { useFormatMessage } from "@/hooks";

const ErrorPage: React.FC = () => {
  const intl = useFormatMessage();
  return (
    <div
      className="tw-bg-dash-sidebar tw-text-foreground tw-min-h-screen tw-flex tw-items-center tw-justify-center tw-relative tw-font-cairo"
      id="error-page"
    >
      <div className="tw-select-none tw-opacity-[5%] tw-filter tw-transition tw-duration-200 tw-blur-sm">
        <h1 className="tw-text-[28rem]">404</h1>
      </div>

      <div className="tw-flex tw-flex-col tw-items-center tw-justify-center tw-absolute">
        <div className="tw-flex tw-flex-col tw-items-center tw-justify-center tw-space-y-3">
          <h1 className="tw-text-2xl">{intl("page.error.title")}</h1>
          <p className="tw-text-xl tw-text-foreground-light">
            {intl("page.error.subtitle")}
          </p>
        </div>
        <div className="tw-mt-4">
          <Button size={"medium"}>{intl("page.error.button.label")}</Button>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
