import React from "react";
import RecordsCount from "@/components/Common/RecordsCount";
import { Spinner } from "@litespace/ui/Spinner";
import cn from "classnames";
import { Typography } from "@litespace/ui/Typography";

const PageTitle: React.FC<{
  title: string;
  fetching?: boolean;
  count?: number;
  className?: string;
}> = ({ title, fetching, count, className }) => {
  return (
    <div className={cn("flex flex-row items-center gap-4", className)}>
      <Typography tag="h1" className="text-h4">
        {title}
        &nbsp;
        {count ? <RecordsCount count={count} /> : null}
      </Typography>
      {fetching ? <Spinner /> : null}
    </div>
  );
};

export default PageTitle;
