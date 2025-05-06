import { Button } from "@litespace/ui/Button";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Web } from "@litespace/utils/routes";
import React, { useMemo } from "react";
import { Link, useRouteError } from "react-router-dom";
import NotFound from "@litespace/assets/NotFound";
import { Typography } from "@litespace/ui/Typography";
import { LoadingError } from "@litespace/ui/Loading";
import cn from "classnames";

const NotFoundError: React.FC = () => {
  const intl = useFormatMessage();
  return (
    <div className="flex flex-col items-center justify-center">
      <NotFound className="w-[458px] h-[324px]" />

      <div className="flex flex-col items-center justify-center mt-6">
        <Typography
          tag="span"
          className="text-subtitle-2 font-normal text-center"
        >
          {intl("error-page.notfound-title")}
        </Typography>

        <Link to={Web.Root} className="mt-4" tabIndex={-1}>
          <Button size="large">
            <Typography tag="span" className="font-medium text-body">
              {intl("error-page.back")}
            </Typography>
          </Button>
        </Link>
      </div>
    </div>
  );
};

const Crash: React.FC<{
  screen?: boolean;
}> = ({ screen }) => {
  const intl = useFormatMessage();
  const error = useRouteError();

  const isNotFound = useMemo(
    () =>
      !!error &&
      typeof error === "object" &&
      "status" in error &&
      typeof error.status === "number" &&
      error.status === 404,
    [error]
  );

  return (
    <div
      className={cn(
        "flex items-center justify-center h-full",
        screen ? "min-h-screen" : "h-full"
      )}
    >
      {isNotFound ? (
        <NotFoundError />
      ) : (
        <div className="[&>div]:w-[352px]">
          <LoadingError
            size="large"
            retry={() => window.location.reload()}
            error={intl("error-page.unexpected")}
          />
        </div>
      )}
    </div>
  );
};

export default Crash;
