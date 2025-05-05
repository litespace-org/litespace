import { Button } from "@litespace/ui/Button";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Web } from "@litespace/utils/routes";
import React, { useMemo } from "react";
import { Link, useRouteError } from "react-router-dom";
import NotFound from "@litespace/assets/404";
import { Typography } from "@litespace/ui/Typography";
import { LoadingError } from "@litespace/ui/Loading";

const ErrorPage: React.FC = () => {
  const intl = useFormatMessage();
  const error = useRouteError();

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

  if (status == 404) {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-screen bg-dash-sidebar text-foreground font-cairo"
        id="error-page"
      >
        <NotFound />

        <Typography
          tag="span"
          className="text-subtitle-2 font-normal mt-6 text-secondary-900 text-center max-w-[405px]"
        >
          {intl("error-page.notfound-title")}
        </Typography>

        <Link to={Web.Root} className="mt-10">
          <Button size={"large"}>{intl("error-page.back")}</Button>
        </Link>
      </div>
    );
  }

  return (
    <div
      id="error-page"
      className="flex items-start justify-center min-h-screen bg-dash-sidebar text-foreground font-cairo"
    >
      <LoadingError
        className="w-[352px] mt-[20.5vh]"
        size="large"
        retry={() => window.location.reload()}
        error={intl("error-page.unexpected")}
      />
    </div>
  );
};

export default ErrorPage;
