import React from "react";
import { Spinner } from "@litespace/luna/Spinner";
import { Typography } from "@litespace/luna/Typography";
import cn from "classnames";
import { useMediaQueries } from "@litespace/luna/hooks/media";

const PageTitle: React.FC<{
  title: string;
  fetching?: boolean;
  className?: string;
}> = ({ title, fetching, className }) => {
  const mq = useMediaQueries();
  return (
    <div className={cn("flex flex-row items-center gap-2", className)}>
      <Typography
        element={mq.sm ? "subtitle-2" : "body"}
        weight="bold"
        className="text-natural-950"
      >
        {title}
      </Typography>
      {fetching ? <Spinner className="w-5 h-5" /> : null}
    </div>
  );
};

export default PageTitle;
