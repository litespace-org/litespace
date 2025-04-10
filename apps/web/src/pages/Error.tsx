import { useSaveLogs } from "@/hooks/logger";
import { useLogger } from "@litespace/headless/logger";
import { Button } from "@litespace/ui/Button";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Web } from "@litespace/utils/routes";
import React, { useMemo } from "react";
import { Link, useRouteError } from "react-router-dom";

const ErrorPage: React.FC = () => {
  const intl = useFormatMessage();
  const error = useRouteError();
  const logger = useLogger();
  logger.error(error);
  const { save } = useSaveLogs();
  console.log(error);

  const status = useMemo(() => {
    if (
      error &&
      typeof error === "object" &&
      "status" in error &&
      typeof error.status === "number"
    )
      return error.status;
    return 404;
  }, [error]);

  return (
    <div
      className="relative flex items-center justify-center min-h-screen bg-dash-sidebar text-foreground font-cairo"
      id="error-page"
    >
      <div className="select-none opacity-[5%] filter transition duration-200 blur-sm">
        <h1 className="text-[28rem]">{status}</h1>
      </div>
      <div className="absolute flex flex-col items-center justify-center">
        <div className="flex flex-col items-center justify-center space-y-3">
          <h1 className="text-2xl">{intl("error-page.title")}</h1>
          <p className="text-xl text-foreground-light">
            {intl("error-page.subtitle")}
          </p>
        </div>
        <div className="flex flex-row gap-5 mt-4">
          <Link to={Web.Root}>
            <Button size={"large"}>{intl("error-page.back")}</Button>
          </Link>
          <Button size={"large"} variant="secondary" onClick={save}>
            {intl("error-page.expor-logs")}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
