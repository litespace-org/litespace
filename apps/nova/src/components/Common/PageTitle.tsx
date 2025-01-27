import React from "react";
import { Spinner } from "@litespace/luna/Spinner";
import { Typography } from "@litespace/luna/Typography";
import cn from "classnames";

const PageTitle: React.FC<{
  title: string;
  fetching?: boolean;
  className?: string;
}> = ({ title, fetching, className }) => {
  return (
    <div className={cn("flex flex-row items-center gap-2", className)}>
      <Typography
        element={{
          default: "body",
          lg: "subtitle-2",
        }}
        className="text-natural-950"
        weight="bold"
      >
        {title}
      </Typography>
      {fetching ? <Spinner className="w-5 h-5" /> : null}
    </div>
  );
};

export default PageTitle;
