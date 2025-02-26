import React from "react";
import { Spinner } from "@litespace/ui/Spinner";
import { Typography } from "@litespace/ui/Typography";
import cn from "classnames";

const PageTitle: React.FC<{
  title: string;
  fetching?: boolean;
  className?: string;
}> = ({ title, fetching, className }) => {
  return (
    <div className={cn("flex flex-row items-center gap-2", className)}>
      <Typography
        tag="h1"
        className="text-natural-950 text-body md:text-subtitle-2 font-bold"
      >
        {title}
      </Typography>
      {fetching ? <Spinner className="w-5 h-5" /> : null}
    </div>
  );
};

export default PageTitle;
