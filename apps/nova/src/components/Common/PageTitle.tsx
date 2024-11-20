import React from "react";
import { Spinner } from "@litespace/luna/Spinner";
import cn from "classnames";
import { Typography } from "@litespace/luna/Typography";

const PageTitle: React.FC<{
  title: string;
  fetching?: boolean;
  className?: string;
}> = ({ title, fetching, className }) => {
  return (
    <div className={cn("flex flex-row items-center gap-4", className)}>
      <Typography element="h4">{title}</Typography>
      {fetching ? <Spinner /> : null}
    </div>
  );
};

export default PageTitle;
